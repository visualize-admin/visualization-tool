import {
  getHierarchy,
  HierarchyNode,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import uniqBy from "lodash/uniqBy";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { StreamClient } from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { truthy } from "@/domain/types";
import { HierarchyValue } from "@/graphql/resolver-types";
import { ResolvedDimension } from "@/graphql/shared-types";

import * as ns from "./namespace";
import { getCubeDimensionValuesWithMetadata } from "./queries";
import {
  pruneTree,
  mapTree,
  getOptionsFromTree,
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
  dimensionIri: string,
  locale: string
): HierarchyValue[] => {
  const serializeNode = (
    node: HierarchyNode,
    depth: number
  ): HierarchyValue | undefined => {
    const name = getName(node.resource, locale);
    // TODO Find out why some hierachy nodes have no label. We filter
    // them out at the moment
    // @see https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/labels.20for.20each.20hierarchy.20level/near/312845
    const res: HierarchyValue | undefined = name
      ? {
          label: name || "-",
          alternateName: node.resource.out(ns.schema.alternateName).term?.value,
          value: node.resource.value,
          children: node.nextInHierarchy
            .map((childNode) => serializeNode(childNode, depth + 1))
            .filter(truthy)
            .filter((d) => d.label),
          position: node.resource.out(ns.schema.position).term?.value,
          identifier: node.resource.out(ns.schema.identifier).term?.value,
          depth,
          dimensionIri: dimensionIri,
        }
      : undefined;
    return res;
  };
  return results.map((r) => serializeNode(r, 0)).filter(truthy);
};

const findHierarchiesForDimension = (cube: Cube, dimensionIri: string) => {
  const newHierarchies = uniqBy(
    cube.ptr
      .any()
      .has(ns.sh.path, rdf.namedNode(dimensionIri))
      .has(ns.cubeMeta.inHierarchy)
      .out(ns.cubeMeta.inHierarchy)
      .toArray(),
    (x) => x.value
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
  sparqlClientStream: StreamClient
): Promise<HierarchyValue[] | null> => {
  const hierarchies = findHierarchiesForDimension(
    rdimension.cube,
    rdimension.data.iri
  );

  if (hierarchies.length === 0) {
    return null;
  }
  const dimensionValuesWithLabels = await getCubeDimensionValuesWithMetadata({
    cube: rdimension.cube,
    dimension: rdimension.dimension,
    sparqlClient,
    locale,
  });

  const allHierarchies = await Promise.all(
    hierarchies?.map(async (h) => ({
      // @ts-ignore
      nodes: (await getHierarchy(h).execute(sparqlClientStream, rdf)) || [],
      hierarchyName: getName(h.out(ns.cubeMeta.nextInHierarchy), locale),
    }))
  );

  const trees = allHierarchies.map((h) => {
    const tree: (HierarchyValue & { hierarchyName?: string })[] = toTree(
      h.nodes,
      rdimension.data.iri,
      locale
    );

    // Augment hierarchy value with hierarchyName so that when regrouping
    // below, we can create the fake nodes
    tree[0].hierarchyName = h.hierarchyName;
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
