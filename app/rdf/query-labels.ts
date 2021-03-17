import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { groups } from "d3";
import { Term } from "rdf-js";
import { sparqlClient } from "./sparql-client";

const BATCH_SIZE = 500;

/**
 * Load labels for a list of IDs (e.g. dimension values)
 *
 * @param ids IDs as rdf-js Terms
 * @param client SparqlClient
 *
 * @todo Add language filter
 */
export async function loadResourceLabels(
  ids: Term[],
  client = sparqlClient
): Promise<Record<string, Term>[]> {
  // We query in batches because we might run into "413 – Error: Payload Too Large"
  const batched = groups(ids, (_, i) => Math.floor(i / BATCH_SIZE));

  const results = await Promise.all(
    batched.map(async ([key, values]) => {
      const query = SELECT`?iri ?label`.WHERE`
        values ?iri {
          ${values}
        }
        ?iri ${schema.name} ?label
      `;

      let result: Record<string, Term>[] = [];
      try {
        result = await query.execute(client.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.log(
          `Could not query labels. First ID of ${ids.length}: <${ids[0].value}>`
        );
        console.error(e);
      }
      return result;
    })
  );

  return results.flat();
}
