import { SELECT } from "@tpluscode/sparql-builder";
import {
  getHierarchy,
  HierarchyNode,
} from "@zazuko/cube-hierarchy-query/index";
import { AnyPointer } from "clownface";
import { ascending, descending } from "d3";
import { isGraphPointer } from "is-graph-pointer";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { NamedNode } from "rdf-js";
import { StreamClient } from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { HierarchyValue } from "@/graphql/resolver-types";
import { pragmas } from "@/rdf/create-source";

import * as ns from "./namespace";
import { pruneTree, mapTree, sortTree, getOptionsFromTree } from "./tree-utils";

const queryDimensionValuesWithLabels = async ({
  dimensionIri,
  client,
  locale,
}: {
  dimensionIri: string;
  client: ParsingClient;
  locale: string;
}): Promise<{ value: string; label: string }[]> => {
  const query = SELECT.DISTINCT`?value ?label`.WHERE`    
    ?cube <https://cube.link/observationSet> ?observationSet .
    ?observationSet <https://cube.link/observation> ?observation .
    ?observation <${dimensionIri}> ?value .

    OPTIONAL {
      ?value <http://schema.org/name> ?language_label .
      FILTER (
        LANGMATCHES(LANG(?language_label), "${locale}")
      )
    }

    OPTIONAL {
      ?value <http://schema.org/name> ?no_language_label .
      FILTER (
        (LANG(?no_language_label) = "")
      )
    }

    BIND(COALESCE(?language_label, ?no_language_label) AS ?label) 
    `.prologue`${pragmas}`;

  const rows = (await query.execute(client.query)) as {
    value: NamedNode;
    label: NamedNode | undefined;
  }[];

  return rows
    .filter((d) => d.label !== undefined)
    .map((r) => ({
      value: r.value.value,
      label: r.label!.value,
    }));
};

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
  cube: Cube,
  dimensionIri: string,
  locale: string,
  sparqlClient: ParsingClient,
  sparqlClientStream: StreamClient
): Promise<HierarchyValue[] | null> => {
  const hierarchy = findHierarchyForDimension(cube, dimensionIri);

  // @ts-ignore
  if (!isGraphPointer(hierarchy)) {
    return null;
  }

  const dimensionValuesWithLabelsProm = queryDimensionValuesWithLabels({
    dimensionIri,
    client: sparqlClient,
    locale,
  });
  const results = await getHierarchy(hierarchy).execute(
    // @ts-ignore
    sparqlClientStream,
    rdf
  );

  const tree = toTree(results, dimensionIri, locale);
  const treeValues = new Set(getOptionsFromTree(tree).map((d) => d.value));
  const dimensionValuesWithLabels = await dimensionValuesWithLabelsProm;
  const dimensionValues = new Set(
    dimensionValuesWithLabels.map((d) => d.value)
  );
  const prunedTree = mapTree(
    pruneTree(tree, (node) => dimensionValues.has(node.value)),
    (node) => ({ ...node, hasValue: dimensionValues.has(node.value) })
  );
  const additionalTreeValues = dimensionValuesWithLabels
    .filter((d) => !treeValues.has(d.value))
    .map((d) => ({
      label: d.label || "-",
      value: d.value,
      depth: -1,
      children: [],
      dimensionIri,
      hasValue: true,
    }));

  return sortTree(
    [...prunedTree, ...additionalTreeValues],
    (a, b) =>
      descending(a.depth, b.depth) ||
      ascending(a.position ?? 0, b.position ?? 0) ||
      ascending(a.label.toLowerCase(), b.label.toLowerCase())
  );
};
