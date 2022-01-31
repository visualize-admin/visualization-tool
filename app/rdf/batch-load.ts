import { SparqlQueryExecutable } from "@tpluscode/sparql-builder/lib";
import { groups } from "d3";
import { NamedNode, Term } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { sparqlClient } from "./sparql-client";

const BATCH_SIZE = 500;

export default async function batchLoad<
  TReturn extends unknown,
  TId extends Term | NamedNode = Term
>({
  ids,
  client = sparqlClient,
  buildQuery,
  batchSize = BATCH_SIZE,
}: {
  ids: TId[];
  client?: ParsingClient;
  buildQuery: (values: TId[], key: number) => SparqlQueryExecutable;
  batchSize?: number;
}): Promise<TReturn[]> {
  const batched = groups(ids, (_, i) => Math.floor(i / batchSize));

  const results = await Promise.all(
    batched.map(async ([key, values]) => {
      const query = buildQuery(values, key);

      try {
        return (await query.execute(client.query, {
          operation: "postUrlencoded",
        })) as unknown as TReturn[];
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
}
