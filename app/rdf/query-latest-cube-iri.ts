/** Creates SPARQL query to fetch latest cube iri.
 * Works for both versioned and unversioned cubes.
 */
export const getLatestCubeIriQuery = (cubeIri: string) => {
  return `PREFIX cube: <https://cube.link/>
PREFIX schema: <http://schema.org/>

SELECT ?iri WHERE {
  {
    # Versioned cube.
    SELECT ?iri WHERE {
      VALUES ?oldIri { <${cubeIri}> }
      ?versionHistory schema:hasPart ?oldIri .
      ?versionHistory schema:hasPart ?iri .
      ?iri schema:version ?version .
      ?iri schema:creativeWorkStatus ?status .
      ?oldIri schema:creativeWorkStatus ?oldStatus .
      FILTER(NOT EXISTS { ?iri schema:expires ?expires . } && ?status IN (?oldStatus, <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>))
    }
  } UNION {
    {
      # Non-versioned cube.
      SELECT ?iri WHERE {
        VALUES ?iri { <${cubeIri}> }
        ?iri cube:observationConstraint ?shape .
        ?iri schema:creativeWorkStatus ?status .
        FILTER(NOT EXISTS { ?iri schema:expires ?expires . } && ?status = <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>)      
      }
    }
  } UNION {
    {
      # Version history of a cube.
      VALUES ?versionHistory { <${cubeIri}> }
      ?versionHistory schema:hasPart ?iri .
      ?iri schema:version ?version .
      ?iri schema:creativeWorkStatus ?status .
      ?oldIri schema:creativeWorkStatus ?oldStatus .
      FILTER(NOT EXISTS { ?iri schema:expires ?expires . } && ?status IN (?oldStatus, <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>))
    }
  }
}
ORDER BY DESC(?version)
LIMIT 1`;
};
