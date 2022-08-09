import { SELECT } from "@tpluscode/sparql-builder";
import { Term } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";
import * as ns from "./namespace";

interface ResourceLabel {
  iri: Term;
  label?: Term;
}

const buildUnitLabelsQuery = (values: Term[], locale: string) => {
  return SELECT.DISTINCT`?iri ?label`.WHERE`
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
};

/**
 * Load labels for a list of unit IDs
 */
export async function loadUnitLabels({
  ids,
  locale = "en",
  sparqlClient,
}: {
  ids: Term[];
  locale?: string;
  sparqlClient: ParsingClient;
}): Promise<ResourceLabel[]> {
  return batchLoad({
    ids,
    sparqlClient,
    buildQuery: (values: Term[]) => buildUnitLabelsQuery(values, locale),
  });
}
