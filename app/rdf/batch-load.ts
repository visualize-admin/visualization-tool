import {
  SparqlQuery,
  SparqlQueryExecutable,
} from "@tpluscode/sparql-builder/lib";
import { groups } from "d3-array";
import { NamedNode, Term } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { executeWithCache } from "./query-cache";

const BATCH_SIZE = 500;

export const batchLoad = async <
  TReturn extends unknown,
  TId extends Term | NamedNode = Term,
>({
  ids,
  sparqlClient,
  cache,
  buildQuery,
  batchSize = BATCH_SIZE,
}: {
  ids: TId[];
  sparqlClient: ParsingClient;
  cache: LRUCache | undefined;
  buildQuery: (
    values: TId[],
    key: number
  ) => SparqlQueryExecutable & SparqlQuery;
  batchSize?: number;
}): Promise<TReturn[]> => {
  const batched = groups(ids, (_, i) => Math.floor(i / batchSize));

  const results = await Promise.all(
    batched.map(async ([key, values]) => {
      const query = buildQuery(values, key).build();

      try {
        return (await executeWithCache(
          sparqlClient,
          query,
          () =>
            sparqlClient.query.select(query, { operation: "postUrlencoded" }),
          (t) => t,
          cache
        )) as unknown as TReturn[];
      } catch (e) {
        console.log(
          `Error while querying. First ID of ${ids.length}: <${ids[0].value}>`
        );
        console.error(e);
        return [];
      }
    })
  );

  return results.flat();
};
