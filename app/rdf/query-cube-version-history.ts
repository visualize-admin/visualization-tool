import ParsingClient from "sparql-http-client/ParsingClient";

/** Creates SPARQL query to fetch cube's version history. */
const getCubeVersionHistoryQuery = (cubeIri: string) => {
  return `PREFIX schema: <http://schema.org/>

SELECT ?versionHistory WHERE {
  ?versionHistory schema:hasPart <${cubeIri}> .
}`;
};

export const queryCubeVersionHistory = async (
  sparqlClient: ParsingClient,
  iri: string
): Promise<string | undefined> => {
  const query = getCubeVersionHistoryQuery(iri);
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return results[0]?.versionHistory.value;
};
