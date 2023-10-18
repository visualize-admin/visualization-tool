import {
  SparqlQuery,
  SparqlQueryExecutable,
} from "@tpluscode/sparql-builder/lib";
import { ParsingClient } from "sparql-http-client/ParsingClient";
import { StreamClient } from "sparql-http-client/StreamClient";
import { LRUCache } from "typescript-lru-cache";

type SparqlClient = StreamClient | ParsingClient;

export const executeWithCache = async <T>(
  sparqlClient: SparqlClient,
  query: SparqlQuery & SparqlQueryExecutable,
  cache: LRUCache | undefined,
  parse: (v: any) => T
) => {
  const key = `${sparqlClient.query.endpoint.endpointUrl} - ${query.build()}`;
  const cached = cache?.get(key);

  if (cached) {
    return cached as T;
  }

  const result = await query.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  });
  const parsed = parse(result) as T;

  if (cache) {
    cache.set(key, parsed);
  }

  return parsed;
};
