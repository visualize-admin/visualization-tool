import { DESCRIBE, SELECT } from "@tpluscode/sparql-builder";
import clownface from "clownface";
import { ascending } from "d3";
import { uniqBy } from "lodash";
import rdf from "rdf-ext";
import { DatasetCore, NamedNode, Quad, Stream } from "rdf-js";

import { HierarchyValue } from "@/graphql/resolver-types";

import * as ns from "./namespace";
import { sparqlClient, sparqlClientStream } from "./sparql-client";

const fromStream = (
  dataset: DatasetCore<Quad, Quad>,
  stream: Stream<Quad>
): Promise<DatasetCore<Quad, Quad>> => {
  return new Promise((resolve) => {
    stream.on("data", (quad: Quad) => dataset.add(quad));
    stream.on("end", () => resolve(dataset));
  });
};

const hasValueAndLabel = (
  o: Record<string, any>
): o is Record<string, string> & { label: string; value: string } => {
  return o.label && o.value ? true : false;
};

const queryDimensionValues = async (dimension: string) => {
  const query = SELECT.DISTINCT`?value`.WHERE`    
      ?cube <https://cube.link/observationSet> ?observationSet .
      ?observationSet <https://cube.link/observation> ?observation .
      ?observation <${dimension}> ?value .
    `;
  const rows = await query.execute(sparqlClient.query);
  return rows.map((r) => r.value.value);
};

export const queryHierarchy = async (
  dimension: string
): Promise<HierarchyValue[]> => {
  const query = DESCRIBE`?hierarchy ?level1 ?level2`.WHERE`    
      SELECT DISTINCT ?hierarchy ?level1 ?level2
  
      WHERE {
    
        ?cube ${ns.cube.observationConstraint} ?shape.
        ?shape ?prop ?blankNode.
        ?blankNode ${ns.sh.path} <${dimension}>.
        ?blankNode ${ns.cubeMeta.hasHierarchy} ?hierarchy.
        ?hierarchy ${ns.cubeMeta.hierarchyRoot} ?level1.
        ?level1 ${ns.schema.hasPart} ?level2 .
    
        filter(isiri(?level2))
    
        OPTIONAL { ?this ${ns.schema.name} ?order0 } 
      }
    `;

  const dimensionValues = new Set(await queryDimensionValues(dimension));
  const stream = await query.execute(sparqlClientStream.query);
  const dataset = await fromStream(rdf.dataset(), stream);
  const cf = clownface({ dataset });

  const schemaName = ns.schema.name as unknown as NamedNode<string>;
  console.log(dimensionValues);

  // TODO find why we need to use uniqBy here
  const res = uniqBy(
    cf
      .out(ns.cubeMeta.hierarchyRoot)
      .map((root) => {
        return {
          label: root.out(schemaName).value,
          value: root.out(ns.schema.identifier).value,
          iri: root.value,
          depth: 0,
          dimensionIri: "",
          children: root
            .out(ns.schema.hasPart)
            .map((c) => {
              return {
                iri: c.value,
                label: c.out(schemaName).value,
                value: c.value,
                dimensionIri: "",
                depth: 1,
                children: [],
              };
            })
            .filter(hasValueAndLabel)
            .filter((x) => dimensionValues.has(x.value))
            .sort((a, b) => ascending(a.label, b.label)),
        };
      })
      .filter(hasValueAndLabel)
      .sort((a, b) => ascending(a.label, b.label)),
    (x) => x.iri
  ).filter((x) => x.children.length > 0) as HierarchyValue[];

  return res;
};
