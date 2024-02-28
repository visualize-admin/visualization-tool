import StreamClient from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

type SparqlClient = StreamClient | ParsingClient;

export const executeWithCache = async <T>(
  sparqlClient: SparqlClient,
  query: string,
  execute: () => Promise<any>,
  parse: (v: any) => T,
  cache: LRUCache | undefined
) => {
  const key = `${sparqlClient.query.endpoint.endpointUrl} - ${query}`;
  const cached = cache?.get(key);

  if (cached) {
    return cached as T;
  }

  const result = await execute();
  const parsed = parse(result) as T;

  if (cache) {
    cache.set(key, parsed);
  }

  return parsed;
};
