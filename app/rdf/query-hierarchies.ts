import {
  HierarchyNode,
  getHierarchy,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import rdf from "rdf-ext";
import { StreamClient } from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { HierarchyValue, parseTerm } from "@/domain/data";
import { truthy } from "@/domain/types";
import { ResolvedDimension } from "@/graphql/shared-types";
import { ExtendedCube } from "@/rdf/extended-cube";
import { getCubeDimensionValuesWithMetadata } from "@/rdf/queries";

import * as ns from "./namespace";
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
  dimensionIri: string,
  locale: string,
  hasValue: (value: string) => boolean
): HierarchyValue[] => {
  const sortChildren = (children: HierarchyValue[]) =>
    orderBy(children, ["position", "identifier"]);
  const serializeNode = (
    node: HierarchyNode,
    depth: number
  ): HierarchyValue | undefined => {
    const name = getName(node.resource, locale);
    // TODO Find out why some hierachy nodes have no label. We filter
    // them out at the moment
    // @see https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/labels.20for.20each.20hierarchy.20level/near/312845

    const identifier = parseTerm(node.resource.out(ns.schema.identifier)?.term);
    const value = node.resource.value;
    const res: HierarchyValue | undefined = name
      ? {
          label: name || "-",
          alternateName: node.resource.out(ns.schema.alternateName).term?.value,
          value,
          children: sortChildren(
            node.nextInHierarchy
              .map((childNode) => serializeNode(childNode, depth + 1))
              .filter(truthy)
              .filter((d) => d.label)
          ),
          position: parseTerm(node.resource.out(ns.schema.position).term),
          identifier,
          depth,
          dimensionIri,
          hasValue: hasValue(value),
        }
      : undefined;
    return res;
  };

  return sortChildren(results.map((r) => serializeNode(r, 0)).filter(truthy));
};

const getDimensionHierarchies = async (
  cube: ExtendedCube,
  dimensionIri: string,
  locale: string
) => {
  const cubeIri = cube.term?.value;

  if (!cubeIri) {
    throw new Error("Cube must have an iri!");
  }

  // Can't rely on the cube here, because sometimes it might contain duplicate
  // hierarchies, due to fetching both cube and shape when cube is initialized.
  // Here we are only interested in shape hierarchies, that's why we don't have
  // to initialize the cube, but rather just fetch its shape.
  const hierarchies = cube.shapePtr
    .any()
    .has(ns.sh.path, rdf.namedNode(dimensionIri))
    .has(ns.cubeMeta.inHierarchy)
    .out(ns.cubeMeta.inHierarchy)
    .toArray();

  return uniqBy(hierarchies, (hierarchy) => getName(hierarchy, locale));
};

export const queryHierarchy = async (
  rdimension: ResolvedDimension,
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient,
  cache: LRUCache | undefined
): Promise<HierarchyValue[] | null> => {
  const {
    cube,
    data: { iri },
  } = rdimension;
  const hierarchyPointers = await getDimensionHierarchies(cube, iri, locale);

  if (hierarchyPointers.length === 0) {
    return null;
  }

  const dimensionValuesWithLabels = await getCubeDimensionValuesWithMetadata({
    cube: rdimension.cube,
    dimension: rdimension.dimension,
    sparqlClient,
    locale,
    cache,
  });

  const hierarchies = await Promise.all(
    hierarchyPointers.map(async (pointer) => {
      return {
        // @ts-ignore
        nodes: await getHierarchy(pointer).execute(sparqlClientStream, rdf),
        hierarchyName: getName(pointer, locale),
      };
    })
  );

  const dimensionValues = new Set(
    dimensionValuesWithLabels.map((d) => `${d.value}`)
  );

  const trees = hierarchies.map(({ nodes, hierarchyName }) => {
    const tree: (HierarchyValue & {
      hierarchyName?: string;
    })[] = toTree(nodes, iri, locale, (d) => dimensionValues.has(d));

    if (tree.length > 0) {
      // Augment hierarchy value with hierarchyName so that when regrouping
      // below, we can create the fake nodes
      tree[0].hierarchyName = hierarchyName;
    }
    return tree;
  });

  const tree = regroupTrees(trees);

  const treeValues = new Set(getOptionsFromTree(tree).map((d) => d.value));
  const prunedTree = mapTree(
    pruneTree(tree, (node) => dimensionValues.has(node.value)),
    (node) => ({ ...node, hasValue: dimensionValues.has(node.value) })
  );
  const additionalTreeValues: HierarchyValue[] = dimensionValuesWithLabels
    .filter((d) => !treeValues.has(`${d.value}`))
    .map((d) => ({
      label: d.label || "ADDITIONAL",
      value: `${d.value}`,
      depth: -1,
      dimensionIri: rdimension.data.iri,
      hasValue: true,
      position: -1,
      identifier: "",
      children: [],
    }));

  return [...prunedTree, ...additionalTreeValues];
};
