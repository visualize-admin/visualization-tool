import { SOURCES_BY_URL } from "@/domain/data-source/constants";

/** As Lindas supports caching requests per given id, we can utilize this function
 * to query endpoint that will cache the results per given cube iri.
 *
 * This means that if we query the same endpoint with the same cube iri, we will
 * get the cached results, unless the cache is invalidated.
 *
 * If cubeIri is not provided, we default to a general cached endpoint, which
 * has much higher cache invalidation time (two minutes as of writing this comment).
 */
export const getMaybeCachedSparqlUrl = ({
  endpointUrl,
  cubeIri,
}: {
  endpointUrl: string;
  cubeIri: string | undefined;
}) => {
  if (SOURCES_BY_URL[endpointUrl]?.supportsCachingPerCubeIri && cubeIri) {
    return `${endpointUrl}/${cubeIri}`;
  }

  return endpointUrl;
};
