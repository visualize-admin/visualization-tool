import groupBy from "lodash/groupBy";
import ParsingClient from "sparql-http-client/ParsingClient";

import { ComponentTermsets } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { queryCubeUnversionedIri } from "@/rdf/query-cube-unversioned-iri";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

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
    queryCubeUnversionedIri(sparqlClient, iri),
    sparqlClient.query.select(query, {
      operation: "postUrlencoded",
    }),
  ]);

  const parsed = qs.map((result) => ({
    dimensionIri: stringifyComponentId({
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
    cubeIri: iri,
    label: termsets[0].dimensionLabel,
    termsets: termsets.map(({ iri, label }) => ({
      iri,
      label,
      __typename: "Termset",
    })),
  }));
};
