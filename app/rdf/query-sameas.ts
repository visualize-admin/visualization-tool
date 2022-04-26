import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";
import { sparqlClient } from "./sparql-client";

interface UnversionedResource {
  iri: NamedNode;
  sameAs?: NamedNode;
}

const buildUnversionedResourceQuery = (values: NamedNode[]) => {
  return SELECT.DISTINCT`?iri ?sameAs`.WHERE`
    values ?iri {
      ${values}
    }
    ?iri ${schema.sameAs} ?sameAs .
  `;
};

/**
 * Load unversioned resources for a list of IDs (e.g. dimension values)
 */
export async function loadUnversionedResources({
  ids,
  client = sparqlClient,
}: {
  ids: NamedNode[];
  client?: ParsingClient;
}): Promise<UnversionedResource[]> {
  return batchLoad({ ids, client, buildQuery: buildUnversionedResourceQuery });
}
