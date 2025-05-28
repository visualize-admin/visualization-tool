import { SELECT } from "@tpluscode/sparql-builder";
import uniqBy from "lodash/uniqBy";
import { Term } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { batchLoad } from "@/rdf/batch-load";
import { pragmas } from "@/rdf/create-source";
import * as ns from "@/rdf/namespace";

type ResourceLabel = {
  iri: Term;
  label?: Term;
};

const buildUnitsQuery = (values: Term[], locale: string) => {
  const uniqueValues = uniqBy(values, (v) => v.value);
  return SELECT.DISTINCT`?iri ?label ?isCurrency ?currencyExponent ?isCurrency`
    .WHERE`
        values ?iri {
          ${uniqueValues}
        }

        OPTIONAL { ?iri ${ns.rdfs.label} ?rdfsLabel }
        OPTIONAL { ?iri  ${ns.qudt.symbol}  ?symbol }
        OPTIONAL { ?iri  ${ns.qudt.ucumCode}  ?ucumCode }
        OPTIONAL { ?iri  ${ns.qudt.expression}  ?expression }

        OPTIONAL { ?iri ?isCurrency ${ns.qudt.CurrencyUnit} }
        OPTIONAL { ?iri ${ns.qudt.currencyExponent} ?currencyExponent }

        BIND(str(coalesce(str(?symbol), str(?ucumCode), str(?expression), str(?rdfsLabel), "?")) AS ?label)

        FILTER ( lang(?rdfsLabel) = "${locale}" || lang(?rdfsLabel) = "en" || datatype(?rdfsLabel) = ${ns.xsd.string} )
      `.prologue`${pragmas}`;
};

/**
 * Load labels for a list of unit IDs
 */
export async function loadUnits({
  ids,
  locale = "en",
  sparqlClient,
  cache,
}: {
  ids: Term[];
  locale?: string;
  sparqlClient: ParsingClient;
  cache: LRUCache | undefined;
}): Promise<ResourceLabel[]> {
  return batchLoad({
    ids,
    sparqlClient,
    buildQuery: (values: Term[]) => buildUnitsQuery(values, locale),
    cache,
  });
}
