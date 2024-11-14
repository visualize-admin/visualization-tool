import groupBy from "lodash/groupBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import { ComponentTermsets, Termset } from "@/domain/data";
import { makeComponentId } from "@/graphql/resolvers/rdf";
import { queryCubeVersionHistory } from "@/rdf/query-cube-version-history";
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
    `PREFIX meta: <https://cube.link/meta/>
PREFIX schema: <http://schema.org/>

SELECT DISTINCT ?termsetIri ?termsetLabel WHERE {
  ?termsetIri meta:isUsedIn <${iri}> .
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
  <${iri}> cube:observationConstraint/sh:property ?dimension .
  ?dimension
    sh:path ?dimensionIri ;
    a cube:KeyDimension ;
    sh:in/rdf:rest*/rdf:first ?value .
  ?value schema:inDefinedTermSet ?termsetIri .
  ?termsetIri a meta:SharedDimension .
  ${buildLocalizedSubQuery("dimension", "schema:name", "dimensionLabel", { locale })}
  ${buildLocalizedSubQuery("termsetIri", "schema:name", "termsetLabel", { locale })}
}`;
  const [unversionedCubeIri = iri, qs] = await Promise.all([
    queryCubeVersionHistory(sparqlClient, iri),
    sparqlClient.query.select(query, {
      operation: "postUrlencoded",
    }),
  ]);

  const parsed = qs.map((result) => ({
    dimensionIri: makeComponentId({
      unversionedCubeIri,
      unversionedComponentIri: result.dimensionIri.value,
    }),
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
