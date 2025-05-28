import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { batchLoad } from "@/rdf/batch-load";
import { pragmas } from "@/rdf/create-source";

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
  `.prologue`${pragmas}`;
};

/**
 * Load unversioned resources for a list of IDs (e.g. dimension values)
 */
export async function loadUnversionedResources({
  ids,
  sparqlClient,
  cache,
}: {
  ids: NamedNode[];
  sparqlClient: ParsingClient;
  cache: LRUCache | undefined;
}): Promise<UnversionedResource[]> {
  return batchLoad({
    ids,
    sparqlClient,
    buildQuery: buildUnversionedResourceQuery,
    cache,
  });
}
