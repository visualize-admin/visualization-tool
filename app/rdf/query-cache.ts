import StreamClient from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache, LRUCacheOptions } from "typescript-lru-cache";

type SparqlClient = StreamClient | ParsingClient;
type SparqlClientQuery = {
  execute: (query: SparqlClient["query"], options: any) => Promise<unknown>;
  build: () => string;
};
export const makeExecuteWithCache = <T>({
  parse,
  cacheOptions,
}: {
  parse: (v: any) => T;
  cacheOptions: LRUCacheOptions<string, T>;
}) => {
  const cache = new LRUCache(cacheOptions);
  return async (sparqlClient: SparqlClient, query: SparqlClientQuery) => {
    const key = `${sparqlClient.query.endpoint.endpointUrl} - ${query.build()}`;
    const cached = cache.get(key);
    if (cached) {
      console.log("Found in cache", key);
      return cached;
    } else {
      const result = await query.execute(sparqlClient.query, {
        operation: "postUrlencoded",
      });
      const parsed = parse(result) as T;
      cache.set(key, parsed);
      return parsed;
    }
  };
};
