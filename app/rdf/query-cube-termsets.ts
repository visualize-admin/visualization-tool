import ParsingClient from "sparql-http-client/ParsingClient";

import { Termset } from "@/domain/data";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

export const getCubeTermsets = async (
  iri: string,
  options: {
    locale: string;
    sparqlClient: ParsingClient;
  }
): Promise<Termset[]> => {
  const { sparqlClient, locale } = options;
  const qs = await sparqlClient.query.select(
    `PREFIX cube: <https://cube.link/>
PREFIX meta: <https://cube.link/meta/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>

SELECT DISTINCT ?termsetIri ?termsetLabel WHERE {
    VALUES (?iri) {(<${iri}>)}

    ?iri cube:observationConstraint/sh:property ?dimension .
    ?dimension a cube:KeyDimension .
    ?dimension sh:in/rdf:rest*/rdf:first ?value.
    ?value schema:inDefinedTermSet ?termsetIri .
    ?termsetIri a meta:SharedDimension .

    ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}
    
}`
  );

  return qs.map((result) => ({
    iri: result.termsetIri.value,
    label: result.termsetLabel.value,
  }));
};
