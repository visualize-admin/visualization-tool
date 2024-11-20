import ParsingClient from "sparql-http-client/ParsingClient";

/** Creates SPARQL query to fetch cube's version history. */
const getCubeUnversionedIriQuery = (cubeIri: string) => {
  return `PREFIX schema: <http://schema.org/>

SELECT ?unversionedIri WHERE {
  ?unversionedIri schema:hasPart <${cubeIri}> .
}`;
};

export const queryCubeUnversionedIri = async (
  sparqlClient: ParsingClient,
  iri: string
): Promise<string | undefined> => {
  const query = getCubeUnversionedIriQuery(iri);
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return results[0]?.unversionedIri.value;
};
