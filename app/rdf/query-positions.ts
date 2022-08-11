import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { NamedNode, Literal } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";

interface ResourcePosition {
  iri: NamedNode;
  position?: Literal;
}

const buildResourcePositionQuery = (values: NamedNode<string>[]) => {
  return SELECT.DISTINCT`?iri ?position`.WHERE`
      values ?iri {
        ${values}
      }
      ?iri ${schema.position} ?position.
    `;
};

/**
 * Load positions for a list of IDs (e.g. dimension values)
 * Dimension must be an ordinal one
 */
export async function loadResourcePositions({
  ids,
  sparqlClient,
}: {
  ids: NamedNode[];
  sparqlClient: ParsingClient;
}) {
  return batchLoad<ResourcePosition, NamedNode>({
    ids,
    sparqlClient,
    buildQuery: (values) => buildResourcePositionQuery(values),
  });
}
