import { schema } from "@tpluscode/rdf-ns-builders";
import { SELECT } from "@tpluscode/sparql-builder";
import { NamedNode, Literal } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import batchLoad from "./batch-load";
import { sparqlClient } from "./sparql-client";

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
  client = sparqlClient,
}: {
  ids: NamedNode[];
  client?: ParsingClient;
}) {
  return batchLoad<ResourcePosition, NamedNode>({
    ids,
    client,
    buildQuery: (values) => buildResourcePositionQuery(values),
  });
}
