import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { groups } from "d3";
import { NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { sparqlClient } from "./sparql-client";

const BATCH_SIZE = 500;

interface UnversionedResource {
  iri: NamedNode;
  sameAs?: NamedNode;
}

/**
 * Load labels for a list of IDs (e.g. dimension values)
 *
 * @param ids IDs as rdf-js Terms
 * @param client SparqlClient
 *
 * @todo Add language filter
 */
export async function loadUnversionedResources({
  ids,
  client = sparqlClient,
}: {
  ids: NamedNode[];
  client?: ParsingClient;
}): Promise<UnversionedResource[]> {
  // We query in batches because we might run into "413 – Error: Payload Too Large"
  const batched = groups(ids, (_, i) => Math.floor(i / BATCH_SIZE));

  const results = await Promise.all(
    batched.map(async ([key, values]) => {
      const query = SELECT.DISTINCT`?iri ?sameAs`.WHERE`
        values ?iri {
          ${values}
        }
        ?iri ${schema.sameAs} ?sameAs .
      `;

      let result: UnversionedResource[] = [];
      try {
        // console.log(query.build());
        result = ((await query.execute(client.query, {
          operation: "postUrlencoded",
        })) as unknown) as UnversionedResource[];
      } catch (e) {
        console.log(
          `Could not query unversioned IRIs. First ID of ${ids.length}: <${ids[0].value}>`
        );
        console.error(e);
      }
      return result;
    })
  );

  return results.flat();
}
