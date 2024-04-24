import ParsingClient from "sparql-http-client/ParsingClient";

/** Creates SPARQL query to fetch latest cube iri.
 * Works for both versioned and unversioned cubes.
 */
export const getLatestCubeIriQuery = (cubeIri: string) => {
  return `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>

SELECT ?iri WHERE {
  {
    # Versioned cube.
    SELECT ?iri ?version WHERE {
      VALUES ?oldIri { <${cubeIri}> }
      ?versionHistory schema:hasPart ?oldIri .
      ?versionHistory schema:hasPart ?iri .
      ?iri schema:version ?version .
      ?iri schema:creativeWorkStatus ?status .
      ?oldIri schema:creativeWorkStatus ?oldStatus .
      FILTER(NOT EXISTS { ?iri schema:expires ?expires . } && ?status IN (?oldStatus, <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>))
    }
    ORDER BY DESC(?version)
  } UNION {
    {
      # Version history of a cube.
      SELECT ?iri ?status ?version WHERE {
        VALUES ?versionHistory { <${cubeIri}> }
        ?versionHistory schema:hasPart ?iri .
        ?iri schema:version ?version .
        ?iri schema:creativeWorkStatus ?status .
        FILTER(NOT EXISTS { ?iri schema:expires ?expires . })
      }
      ORDER BY DESC(?status) DESC(?version)
    }
  } UNION {
    {
      # Non-versioned cube.
      SELECT ?iri ?status WHERE {
        VALUES ?iri { <${cubeIri}> }
        ?iri cube:observationConstraint ?shape .
        ?iri schema:creativeWorkStatus ?status .
        FILTER(NOT EXISTS { ?iri schema:expires ?expires . } && NOT EXISTS { ?versionHistory schema:hasPart ?iri . })
      }
      ORDER BY DESC(?status)
    }
  }
}
LIMIT 1`;
};

export const queryLatestCubeIri = async (
  sparqlClient: ParsingClient,
  iri: string
): Promise<string | undefined> => {
  const query = getLatestCubeIriQuery(iri);
  const results = await sparqlClient.query.select(query, {
    operation: "postUrlencoded",
  });

  return results[0]?.iri.value;
};
