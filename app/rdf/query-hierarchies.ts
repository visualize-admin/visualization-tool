import {
  getHierarchy,
  HierarchyNode,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import orderBy from "lodash/orderBy";
import uniqBy from "lodash/uniqBy";
import rdf from "rdf-ext";
import { StreamClient } from "sparql-http-client";

import { DimensionValue, HierarchyValue, parseTerm } from "@/domain/data";
import { truthy } from "@/domain/types";
import { ResolvedDimension } from "@/graphql/shared-types";
import { ExtendedCube } from "@/rdf/extended-cube";
import * as ns from "@/rdf/namespace";
import {
  getOptionsFromTree,
  mapTree,
  pruneTree,
  regroupTrees,
  sortHierarchy,
} from "@/rdf/tree-utils";

const getName = (pointer: AnyPointer, language: string) => {
  const name = pointer.out(ns.schema.name, { language })?.value;
  if (name) {
    return name;
  }
  return pointer.out(ns.schema.name)?.value;
};

const toTree = (
  results: HierarchyNode[],
  dimensionId: string,
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
    // TODO Find out why some hierarchy nodes have no label. We filter
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
          position: parseTerm(node.resource.out(ns.schema.position).term) ?? 0,
          identifier,
          depth,
          dimensionId,
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
    throw Error("Cube must have an iri!");
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

export const queryHierarchies = async (
  resolvedDimension: ResolvedDimension,
  options: { locale: string; sparqlClientStream: StreamClient }
) => {
  const {
    cube,
    data: { iri },
  } = resolvedDimension;
  const { locale, sparqlClientStream } = options;
  const pointers = await getDimensionHierarchies(cube, iri, locale);

  if (pointers.length === 0) {
    return null;
  }

  return await Promise.all(
    pointers.map(async (ptr) => {
      return {
        nodes: await getHierarchy(ptr, {
          properties: [
            ns.schema.identifier,
            ns.schema.name,
            ns.schema.description,
            ns.schema.position,
            ns.schema.alternateName,
          ],
          // @ts-ignore
        }).execute(sparqlClientStream, rdf),
        hierarchyName: getName(ptr, locale),
      };
    })
  );
};

export const parseHierarchy = (
  hierarchies: NonNullable<Awaited<ReturnType<typeof queryHierarchies>>>,
  options: {
    dimensionId: string;
    locale: string;
    dimensionValues: DimensionValue[];
  }
): HierarchyValue[] => {
  const { dimensionId, locale, dimensionValues } = options;
  const rawValues = new Set(dimensionValues.map((d) => `${d.value}`));
  const trees = hierarchies.map(({ nodes, hierarchyName }) => {
    const tree: (HierarchyValue & {
      hierarchyName?: string;
    })[] = toTree(nodes, dimensionId, locale, (d) => rawValues.has(d));

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
    pruneTree(tree, (node) => rawValues.has(node.value)),
    (node) => ({ ...node, hasValue: rawValues.has(node.value) })
  );
  const additionalTreeValues = dimensionValues
    .filter((d) => !treeValues.has(`${d.value}`))
    .map((d) => ({
      label: d.label || "ADDITIONAL",
      value: `${d.value}`,
      depth: 0,
      dimensionId,
      hasValue: true,
      position: 9999,
      identifier: "",
      children: [],
    }));

  return sortHierarchy([...prunedTree, ...additionalTreeValues]);
};
