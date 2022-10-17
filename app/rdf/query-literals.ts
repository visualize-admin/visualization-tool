import { SELECT } from "@tpluscode/sparql-builder";
import { NamedNode, Literal } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import batchLoad from "./batch-load";
import { pragmas } from "./create-source";

type ResourceLiteral = {
  iri: NamedNode;
  value?: Literal;
};

const buildResourceLiteralQuery = ({
  values,
  predicate,
}: {
  values: NamedNode<string>[];
  predicate: NamedNode<string>;
}) => {
  return SELECT.DISTINCT`?iri ?value`.WHERE`
      values ?iri {
        ${values}
      }

      ?iri ${predicate} ?value .
    `.prologue`${pragmas}`;
};

/**
 * Load literals for a list of IDs (e.g. dimension values, positions, colors)
 */
export async function loadResourceLiterals({
  ids,
  sparqlClient,
  predicate,
}: {
  ids: NamedNode[];
  sparqlClient: ParsingClient;
  predicate: NamedNode<string>;
}) {
  return batchLoad<ResourceLiteral, NamedNode>({
    ids,
    sparqlClient,
    buildQuery: (values) => buildResourceLiteralQuery({ values, predicate }),
  });
}
