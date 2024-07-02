import groupBy from "lodash/groupBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import { ComponentTermsets, Termset } from "@/domain/data";
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

export const getCubeTermsets = async (
  iri: string,
  options: {
    locale: string;
    sparqlClient: ParsingClient;
  }
): Promise<Termset[]> => {
  const { sparqlClient, locale } = options;
  const qs = await sparqlClient.query.select(
    `PREFIX meta: <https://cube.link/meta/>
PREFIX schema: <http://schema.org/>

SELECT DISTINCT ?termsetIri ?termsetLabel WHERE {
  VALUES (?cubeIri) {(<${iri}>)}
  ?termsetIri meta:isUsedIn ?cubeIri .
    ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}
}`,
    { operation: "postUrlencoded" }
  );

  return qs.map((result) => ({
    iri: result.termsetIri.value,
    label: result.termsetLabel.value,
    __typename: "Termset",
  }));
};

export const getCubeComponentTermsets = async (
  iri: string,
  options: {
    locale: string;
    sparqlClient: ParsingClient;
  }
): Promise<ComponentTermsets[]> => {
  const { sparqlClient, locale } = options;
  const query = `PREFIX cube: <https://cube.link/>
PREFIX meta: <https://cube.link/meta/>
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX schema: <http://schema.org/>
PREFIX sh: <http://www.w3.org/ns/shacl#>

SELECT DISTINCT ?dimensionIri ?dimensionLabel ?termsetIri ?termsetLabel WHERE {
  VALUES (?iri) {(<${iri}>)}

  ?iri cube:observationConstraint/sh:property ?dimension .
  ?dimension sh:path ?dimensionIri .
  ?dimension a cube:KeyDimension .
  ?dimension sh:in/rdf:rest*/rdf:first ?value.
  ?value schema:inDefinedTermSet ?termsetIri .
  ?termsetIri a meta:SharedDimension .

  ${buildLocalizedSubQuery("dimension", "schema:name", "dimensionLabel", { locale })}
  ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}
  
}`;
  const qs = await sparqlClient.query.select(query);

  const parsed = qs.map((result) => ({
    dimensionIri: result.dimensionIri.value,
    dimensionLabel: result.dimensionLabel.value,
    iri: result.termsetIri.value,
    label: result.termsetLabel.value,
  }));

  const grouped = Object.entries(groupBy(parsed, (r) => r.dimensionIri));

  return grouped.map(([dimensionIri, termsets]) => ({
    iri: dimensionIri,
    label: termsets[0].dimensionLabel,
    termsets: termsets.map(({ iri, label }) => ({
      iri,
      label,
      __typename: "Termset",
    })),
  }));
};
