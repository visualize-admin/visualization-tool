import { SELECT } from "@tpluscode/sparql-builder";
import { Term } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";
import { pragmas } from "./create-source";
import * as ns from "./namespace";

interface ResourceLabel {
  iri: Term;
  label?: Term;
}

const buildUnitsQuery = (values: Term[], locale: string) => {
  return SELECT.DISTINCT`?iri ?label ?isCurrency ?currencyExponent ?isCurrency`
    .WHERE`
        values ?iri {
          ${values}
        }

        OPTIONAL { ?iri ${ns.rdfs.label} ?rdfsLabel }
        OPTIONAL { ?iri  ${ns.qudt.symbol}  ?symbol }
        OPTIONAL { ?iri  ${ns.qudt.ucumCode}  ?ucumCode }
        OPTIONAL { ?iri  ${ns.qudt.expression}  ?expression }

        OPTIONAL { ?iri ?isCurrency ${ns.qudt.CurrencyUnit} }
        OPTIONAL { ?iri ${ns.qudt.currencyExponent} ?currencyExponent }

        BIND(str(coalesce(str(?symbol), str(?ucumCode), str(?expression), str(?rdfsLabel), "?")) AS ?label)
        
        FILTER ( lang(?rdfsLabel) = "${locale}" )
      `.prologue`${pragmas}`;
};

/**
 * Load labels for a list of unit IDs
 */
export async function loadUnits({
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
    buildQuery: (values: Term[]) => buildUnitsQuery(values, locale),
  });
}
