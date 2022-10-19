import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";
import { pragmas } from "./create-source";

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
}: {
  ids: NamedNode[];
  sparqlClient: ParsingClient;
}): Promise<UnversionedResource[]> {
  return batchLoad({
    ids,
    sparqlClient,
    buildQuery: buildUnversionedResourceQuery,
  });
}
