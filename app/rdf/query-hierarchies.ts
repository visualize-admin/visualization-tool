import {
  getHierarchy,
  HierarchyNode,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Quad } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { StreamClient } from "sparql-http-client/StreamClient";
import { LRUCache } from "typescript-lru-cache";

import { truthy } from "@/domain/types";
import { HierarchyValue } from "@/graphql/resolver-types";
import { ResolvedDimension } from "@/graphql/shared-types";

import * as ns from "./namespace";
import { getCubeDimensionValuesWithMetadata } from "./queries";
import {
  getOptionsFromTree,
  mapTree,
  pruneTree,
  regroupTrees,
} from "./tree-utils";

const getName = (pointer: AnyPointer, language: string) => {
  const name = pointer.out(ns.schema.name, { language })?.value;
  if (name) {
    return name;
  }
  return pointer.out(ns.schema.name)?.value;
};

const toTree = (
  results: HierarchyNode[],
  dimensionIri: string
): HierarchyValue[] => {
  const sortChildren = (children: HierarchyValue[]) =>
    orderBy(children, ["position", "identifier"]);
  const serializeNode = (
    node: HierarchyNode,
    depth: number
  ): HierarchyValue | undefined => {
    const resource = node.resource;
    // TODO Find out why some hierachy nodes have no label. We filter
    // them out at the moment
    // @see https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/labels.20for.20each.20hierarchy.20level/near/312845
    const name = resource.out(ns.schema.name).value;
    const res: HierarchyValue | undefined = name
      ? {
          dimensionIri,
          depth,
          label: name || "-",
          alternateName: resource.out(ns.schema.alternateName).value,
          value: resource.value,
          children: sortChildren(
            node.nextInHierarchy
              .map((childNode) => serializeNode(childNode, depth + 1))
              .filter(truthy)
              .filter((d) => d.label)
          ),
          position: resource.out(ns.schema.position).value,
          identifier: resource.out(ns.schema.identifier).value,
        }
      : undefined;
    return res;
  };

  return sortChildren(results.map((r) => serializeNode(r, 0)).filter(truthy));
};

const findHierarchiesForDimension = (
  cube: Cube,
  dimensionIri: string,
  locale: string
) => {
  const newHierarchies = uniqBy(
    cube.ptr
      .any()
      .has(ns.sh.path, rdf.namedNode(dimensionIri))
      .has(ns.cubeMeta.inHierarchy)
      .out(ns.cubeMeta.inHierarchy)
      .toArray(),
    (x) => getName(x, locale)
  );

  if (newHierarchies) {
    return newHierarchies;
  }

  const legacyHierarchies = cube.ptr
    .any()
    .has(ns.sh.path, rdf.namedNode(dimensionIri))
    .has(ns.cubeMeta.hasHierarchy)
    .out(ns.cubeMeta.hasHierarchy)
    .toArray();

  if (legacyHierarchies) {
    return legacyHierarchies;
  }

  return [];
};

export const queryHierarchy = async (
  rdimension: ResolvedDimension,
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient<Quad>,
  cache: LRUCache | undefined
): Promise<HierarchyValue[] | null> => {
  const hierarchies = findHierarchiesForDimension(
    rdimension.cube,
    rdimension.data.iri,
    locale
  );

  if (hierarchies.length === 0) {
    return null;
  }

  const [dimensionValuesWithLabels, ...allHierarchies] = await Promise.all([
    getCubeDimensionValuesWithMetadata({
      cube: rdimension.cube,
      dimension: rdimension.dimension,
      sparqlClient,
      locale,
      cache,
    }),
    ...hierarchies?.map(async (hierarchy) => ({
      nodes:
        // @ts-ignore
        (await getHierarchy(hierarchy, {
          properties: [
            ns.schema.identifier,
            [ns.schema.name, { language: locale }],
            [ns.schema.description, { language: locale }],
            ns.schema.position,
            [ns.schema.alternateName, { language: locale }],
          ],
          // @ts-ignore
        }).execute(sparqlClientStream, rdf)) || [],
      hierarchyName: getName(
        hierarchy.out(ns.cubeMeta.nextInHierarchy),
        locale
      ),
    })),
  ]);

  const trees = allHierarchies.map((h) => {
    const tree: (HierarchyValue & { hierarchyName?: string })[] = toTree(
      h.nodes,
      rdimension.data.iri
    );

    if (tree.length > 0) {
      // Augment hierarchy value with hierarchyName so that when regrouping
      // below, we can create the fake nodes
      tree[0].hierarchyName = h.hierarchyName;
    }
    return tree;
  });

  const tree = regroupTrees(trees);

  const treeValues = new Set(getOptionsFromTree(tree).map((d) => d.value));
  const dimensionValues = new Set(
    dimensionValuesWithLabels.map((d) => `${d.value}`)
  );
  const prunedTree = mapTree(
    pruneTree(tree, (node) => dimensionValues.has(node.value)),
    (node) => ({ ...node, hasValue: dimensionValues.has(node.value) })
  );
  const additionalTreeValues = dimensionValuesWithLabels
    .filter((d) => !treeValues.has(`${d.value}`))
    .map(
      (d) =>
        ({
          label: d.label || "ADDITIONAL",
          value: `${d.value}`,
          depth: -1,
          children: [],
          dimensionIri: rdimension.data.iri,
          hasValue: true,
          position: "-1",
          identifier: "",
        } as HierarchyValue)
    );

  return [...prunedTree, ...additionalTreeValues];
};
