import ParsingClient from "sparql-http-client/ParsingClient";

import { Termset } from "@/domain/data";
import {
  buildLocalizedSubQuery,
  makeVisualizeDatasetFilter,
} from "@/rdf/query-utils";

export const queryAllTermsets = async (options: {
  locale: string;
  sparqlClient: ParsingClient;
  includeDrafts?: boolean;
}): Promise<{ termset: Termset; count: number }[]> => {
  const { sparqlClient, locale, includeDrafts } = options;
  const qs = await sparqlClient.query.select(
    `PREFIX cube: <https://cube.link/>
PREFIX meta: <https://cube.link/meta/>
PREFIX schema: <http://schema.org/>

SELECT DISTINCT (COUNT(DISTINCT ?cubeIri) as ?count) ?termsetIri ?termsetLabel WHERE {
  ?termsetIri meta:isUsedIn ?cubeIri .
  ${makeVisualizeDatasetFilter({
    includeDrafts: !!includeDrafts,
    cubeIriVar: "?cubeIri",
  })}
  ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}

} GROUP BY ?termsetIri ?termsetLabel`,
    { operation: "postUrlencoded" }
  );

  return qs.map((result) => ({
    count: +result.count.value,
    termset: {
      __typename: "Termset",
      iri: result.termsetIri.value,
      label: result.termsetLabel.value,
    },
  }));
};
