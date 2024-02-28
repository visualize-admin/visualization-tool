import StreamClient from "sparql-http-client";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

type SparqlClient = StreamClient | ParsingClient;

export const executeWithCache = async <Executed, Parsed>(
  sparqlClient: SparqlClient,
  query: string,
  execute: () => Promise<Executed>,
  parse: (result: Executed) => Parsed,
  cache: LRUCache | undefined
) => {
  const key = `${sparqlClient.query.endpoint.endpointUrl} - ${query}`;
  const cached = cache?.get(key);

  if (cached) {
    return cached as Parsed;
  }

  const result = await execute();
  const parsed = parse(result) as Parsed;

  if (cache) {
    cache.set(key, parsed);
  }

  return parsed;
};
