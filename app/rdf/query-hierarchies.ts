import {
  getHierarchy,
  HierarchyNode,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import { isGraphPointer } from "is-graph-pointer";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { StreamClient } from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { HierarchyValue } from "@/graphql/resolver-types";
import { ResolvedDimension } from "@/graphql/shared-types";

import * as ns from "./namespace";
import { getCubeDimensionValuesWithMetadata } from "./queries";
import { pruneTree, mapTree, getOptionsFromTree } from "./tree-utils";

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
  ): HierarchyValue => {
    const res: HierarchyValue = {
      label: getName(node.resource, locale) || "-",
      alternateName: node.resource.out(ns.schema.alternateName).term?.value,
      value: node.resource.value,
      children: node.nextInHierarchy.map((childNode) =>
        serializeNode(childNode, depth + 1)
      ),
      position: node.resource.out(ns.schema.position).term?.value,
      identifier: node.resource.out(ns.schema.identifier).term?.value,
      depth,
      dimensionIri: dimensionIri,
    };
    return res;
  };
  return results.map((r) => serializeNode(r, 0));
};

const findHierarchyForDimension = (cube: Cube, dimensionIri: string) => {
  const newHierarchy = cube.ptr
    .any()
    .has(ns.sh.path, rdf.namedNode(dimensionIri))
    .has(ns.cubeMeta.inHierarchy)
    .out(ns.cubeMeta.inHierarchy)
    .toArray()[0];
  if (newHierarchy) {
    return newHierarchy;
  }
  const legacyHierarchy = cube.ptr
    .any()
    .has(ns.sh.path, rdf.namedNode(dimensionIri))
    .has(ns.cubeMeta.hasHierarchy)
    .out(ns.cubeMeta.hasHierarchy)
    .toArray()[0];
  if (legacyHierarchy) {
    return legacyHierarchy;
  }
};

export const queryHierarchy = async (
  rdimension: ResolvedDimension,
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient
): Promise<HierarchyValue[] | null> => {
  const hierarchy = findHierarchyForDimension(
    rdimension.cube,
    rdimension.data.iri
  );

  // @ts-ignore
  if (!isGraphPointer(hierarchy)) {
    return null;
  }
  const dimensionValuesWithLabels = await getCubeDimensionValuesWithMetadata({
    cube: rdimension.cube,
    dimension: rdimension.dimension,
    sparqlClient,
    locale,
  });

  const results = await getHierarchy(hierarchy).execute(
    // @ts-ignore
    sparqlClientStream,
    rdf
  );

  const tree = toTree(results, rdimension.data.iri, locale);
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
          label: d.label || "-",
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
