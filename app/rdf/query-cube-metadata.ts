import { SELECT } from "@tpluscode/sparql-builder";
import { schema } from "@tpluscode/rdf-ns-builders";

import ParsingClient from "sparql-http-client/ParsingClient";

import { sparqlClient } from "./sparql-client";
import { DataCubeTheme } from "../graphql/query-hooks";

export async function loadThemes({
  locale,
  client = sparqlClient,
}: {
  locale?: string | null;
  client?: ParsingClient;
}): Promise<DataCubeTheme[]> {
  const query = SELECT.ALL.WHERE`
    graph   <https://lindas.admin.ch/sfa/opendataswiss> {
      ?theme a ${schema.DefinedTerm} ;
        ${schema.name} ?name ;
        ${schema.inDefinedTermSet} <https://register.ld.admin.ch/opendataswiss/category> .        
      filter (langmatches(lang(?name), "${locale}"))
    }
  `;
  const results = await query.execute(client.query, {
    operation: "postUrlencoded",
  });

  return results.map((r) => ({
    name: r.name.value,
    theme: r.theme.value,
    __typename: "DataCubeTheme",
  }));
}
