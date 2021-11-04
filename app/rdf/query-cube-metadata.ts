import { SELECT } from "@tpluscode/sparql-builder";
import { sparql } from "@tpluscode/rdf-string";
import { schema } from "@tpluscode/rdf-ns-builders";
import { Literal, NamedNode } from "rdf-js";

import ParsingClient from "sparql-http-client/ParsingClient";

import { sparqlClient } from "./sparql-client";
import { DataCubeCategory } from "../graphql/query-hooks";

export async function loadCategories({
  locale,
  client = sparqlClient,
}: {
  locale?: string | null;
  client?: ParsingClient;
}): Promise<DataCubeCategory[]> {
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
  })) as DatasetCategory[];
}
