import { sparql } from "@tpluscode/rdf-string";
import { SELECT } from "@tpluscode/sparql-builder";
import { groups } from "d3";
import { NamedNode, Term } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { getQueryLocales } from "./parse";
import { sparqlClient } from "./sparql-client";
import * as ns from "./namespace";

const BATCH_SIZE = 500;

interface ResourceLabel {
  iri: Term;
  label?: Term;
}

/**
 * Load labels for a list of unit IDs
 *
 * @param ids IDs as rdf-js Terms
 * @param client SparqlClient
 *
 * @todo Add language filter
 */
export async function loadUnitLabels({
  ids,
  locale = "en",
  client = sparqlClient,
}: {
  ids: Term[];
  locale?: string;
  client?: ParsingClient;
}): Promise<ResourceLabel[]> {
  // We query in batches because we might run into "413 – Error: Payload Too Large"
  const batched = groups(ids, (_, i) => Math.floor(i / BATCH_SIZE));

  const results = await Promise.all(
    batched.map(async ([key, values]) => {
      const query = SELECT.DISTINCT`?iri ?label`.WHERE`
        values ?iri {
          ${values}
        }

        OPTIONAL { ?iri ${ns.rdfs.label} ?rdfsLabel }
        OPTIONAL { ?iri  ${ns.qudt.symbol}  ?symbol }
        OPTIONAL { ?iri  ${ns.qudt.ucumCode}  ?ucumCode }
        OPTIONAL { ?iri  ${ns.qudt.expression}  ?expression }

        BIND(str(coalesce(str(?symbol), str(?ucumCode), str(?expression), str(?rdfsLabel), "?")) AS ?label)
        
        FILTER ( lang(?rdfsLabel) = "${locale}" )
      `;

      let result: ResourceLabel[] = [];
      try {
        // console.log(query.build());
        result = (await query.execute(client.query, {
          operation: "postUrlencoded",
        })) as unknown as ResourceLabel[];
      } catch (e) {
        console.log(
          `Could not query labels. First ID of ${ids.length}: <${ids[0].value}>`
        );
        console.error(e);
      }
      return result;
    })
  );

  return results.flat();
}
