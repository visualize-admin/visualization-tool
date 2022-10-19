import { SELECT } from "@tpluscode/sparql-builder";
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
import { createSource, pragmas } from "@/rdf/create-source";

import * as ns from "./namespace";
import { pruneTree, mapTree } from "./tree-utils";

const queryDimensionValues = async (
  dimension: string,
  sparqlClient: ParsingClient
) => {
  const query = SELECT.DISTINCT`?value`.WHERE`    
      ?cube <https://cube.link/observationSet> ?observationSet .
      ?observationSet <https://cube.link/observation> ?observation .
      ?observation <${dimension}> ?value .
    `.prologue`${pragmas}`;
  const rows = await query.execute(sparqlClient.query);
  return rows.map((r) => r.value.value);
};

const getName = (pointer: AnyPointer, language: string) => {
  let name = pointer.out(ns.schema.name, { language })?.value;
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
      value: node.resource.value,
      children: node.nextInHierarchy.map((childNode) =>
        serializeNode(childNode, depth + 1)
      ),
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
  dimensionIri: string,
  sourceUrl: string,
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient
): Promise<HierarchyValue[] | null> => {
  const source = createSource({ endpointUrl: sourceUrl });

  const cubeQuery = SELECT`?cube`.WHERE`
  ?cube ${ns.cube.observationConstraint} ?shape.
  ?shape ?prop ?dimension.
  ?dimension ${ns.sh.path} <${dimensionIri}>.
  
  FILTER NOT EXISTS { ?cube ${ns.schema.expires} ?any . }
  `.prologue`${pragmas}`;
  const cubeResults = await cubeQuery.execute(sparqlClient.query);
  if (cubeResults.length === 0) {
    throw new Error("Could not find cube");
  }

  const cubeIri = cubeResults[0].cube.value;
  const cube = await source.cube(cubeIri);
  if (!cube) {
    throw new Error("Could not find cube");
  }
  const hierarchy = findHierarchyForDimension(cube, dimensionIri);

  // @ts-ignore
  if (!isGraphPointer(hierarchy)) {
    return null;
  }

  const dimensionValuesProm = queryDimensionValues(dimensionIri, sparqlClient);
  const results = await getHierarchy(hierarchy).execute(
    // @ts-ignore
    sparqlClientStream,
    rdf
  );

  const tree = toTree(results, dimensionIri, locale);
  const dimensionValues = new Set(await dimensionValuesProm);
  return mapTree(
    pruneTree(tree, (node) => dimensionValues.has(node.value)),
    (node) => ({ ...node, hasValue: dimensionValues.has(node.value) })
  );
};
