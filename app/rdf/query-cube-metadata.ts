import { SELECT } from "@tpluscode/sparql-builder";
import { schema } from "@tpluscode/rdf-ns-builders";

import ParsingClient from "sparql-http-client/ParsingClient";

import { sparqlClient } from "./sparql-client";
import { DataCubeTheme } from "../graphql/query-hooks";
import { keyBy } from "lodash";

const parseSparqlTheme = (sparqlTheme: any) => {
  return {
    label: sparqlTheme.name.value,
    iri: sparqlTheme.theme.value,
    __typename: "DataCubeTheme",
  } as DataCubeTheme;
};


// Handles both batch loading and loading all themes
// Batch loading is done by load all themes and then filtering according to given IRIs
export const createThemeLoader =
  ({ locale }: { locale: string }) =>
  async (filterIris?: readonly string[]): Promise<(DataCubeTheme | null)[]> => {
    const query = SELECT.ALL.WHERE`
    graph   <https://lindas.admin.ch/sfa/opendataswiss> {
      ?theme a ${schema.DefinedTerm} ;
        ${schema.name} ?name ;
        ${schema.inDefinedTermSet} <https://register.ld.admin.ch/opendataswiss/category> .        
      filter (langmatches(lang(?name), "${locale}"))
    }
  `;
    const results = await query.execute(sparqlClient.query, {
      operation: "postUrlencoded",
    });

    if (filterIris) {
      const resultsByIri = keyBy(results, (x) => x.theme.value);
      return filterIris.map((iri) => {
        const theme = resultsByIri[iri];
        return theme ? parseSparqlTheme(theme) : null;
      });
    }

    const parsed = results.map(parseSparqlTheme);


    return parsed;
  };

export const loadThemes = ({ locale }: { locale: string }) => {
  return createThemeLoader({ locale })();
};
