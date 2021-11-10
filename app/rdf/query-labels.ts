import { schema } from "@tpluscode/rdf-ns-builders";
import { sparql } from "@tpluscode/rdf-string";
import { SELECT } from "@tpluscode/sparql-builder";
import { groups } from "d3";
import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";
import { getQueryLocales } from "./parse";
import { sparqlClient } from "./sparql-client";

const BATCH_SIZE = 500;

interface ResourceLabel {
  iri: NamedNode;
  label?: Literal;
}

export const makeLocalesFilter = (
  subjectVar: string,
  predicate: NamedNode,
  objectVar: string,
  wantedLocale: string
) => {
  const locales = getQueryLocales(wantedLocale);

  const localesFilters = locales.map((locale) =>
    locale !== ""
      ? sparql`OPTIONAL {
    ${subjectVar} ${predicate} ${objectVar}_${locale}
    FILTER (LANGMATCHES(LANG(${objectVar}_${locale}), "${locale}"))
  }`
      : sparql`OPTIONAL {
    ${subjectVar} ${predicate} ${objectVar}_${locale}
    FILTER ((LANG(${objectVar}_${locale}) = ""))
  }`
  );

  return sparql`${localesFilters}
  BIND(COALESCE(${locales
    .map((locale) => `${objectVar}_${locale}`)
    .join(",")}) as ${objectVar})
  `;
};

/**
 * Load labels for a list of IDs (e.g. dimension values)
 *
 * @param ids IDs as rdf-js Terms
 * @param client SparqlClient
 *
 * @todo Add language filter
 */
export async function loadResourceLabels({
  ids,
  locale,
  labelTerm = schema.name,
  client = sparqlClient,
}: {
  ids: NamedNode[];
  locale: string;
  labelTerm?: NamedNode;
  client?: ParsingClient;
}): Promise<ResourceLabel[]> {
  // We query in batches because we might run into "413 – Error: Payload Too Large"
  const batched = groups(ids, (_, i) => Math.floor(i / BATCH_SIZE));

  const localesFilter = makeLocalesFilter("?iri", labelTerm, "?label", locale);
  const results = await Promise.all(
    batched.map(async ([key, values]) => {
      const query = SELECT.DISTINCT`?iri ?label`.WHERE`
        values ?iri {
          ${values}
        }
        ${localesFilter}
      `;

      let result: ResourceLabel[] = [];
      try {
        result = (await query.execute(client.query, {
          operation: "postUrlencoded",
        })) as unknown as ResourceLabel[];
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
