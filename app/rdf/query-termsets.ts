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
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>

SELECT DISTINCT (COUNT(distinct ?iri) as ?count) ?termsetIri ?termsetLabel WHERE {
    ?iri cube:observationConstraint/sh:property ?dimension .
    ?dimension a cube:KeyDimension .
    ?dimension sh:in/rdf:rest*/rdf:first ?value.
    ?value schema:inDefinedTermSet ?termsetIri .
    ?termsetIri a meta:SharedDimension .
    ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}

    ${makeVisualizeDatasetFilter({
      includeDrafts: !!includeDrafts,
      cubeIriVar: "?iri",
    }).toString()}

  }      GROUP BY ?termsetIri ?termsetLabel`, {
    operation: "postUrlencoded",
  }
  );

  return qs.map((result) => ({
    count: Number(result.count.value),
    termset: {
      __typename: "Termset",
      iri: result.termsetIri.value,
      label: result.termsetLabel.value,
    },
  }));
};
