import { sparql } from "@tpluscode/sparql-builder";

import { locales } from "@/locales/locales";

import { cube, schema } from "../../app/rdf/namespace";

export const GROUP_SEPARATOR = "|||";

export const buildLocalizedSubQuery = (
  s: string,
  p: string,
  o: string,
  {
    locale,
    fallbackToNonLocalized,
  }: {
    locale: string;
    fallbackToNonLocalized?: boolean;
  }
) => {
  // Include the empty locale as well.
  const locales = getOrderedLocales(locale).concat("");

  return `${locales
    .map(
      (locale) => `OPTIONAL {
          ?${s} ${p} ?${o}_${locale} .
          FILTER(LANG(?${o}_${locale}) = "${locale}")
        }`
    )
    .join("\n")}
    ${fallbackToNonLocalized ? `OPTIONAL { ?${s} ${p} ?${o}_raw }` : ""}
      BIND(COALESCE(${locales.map((locale) => `?${o}_${locale}`).join(", ")} ${
    fallbackToNonLocalized ? `, ?${o}_raw` : ``
  }) AS ?${o})
  `;
};

const getOrderedLocales = (locale: string) => {
  const rest = locales.filter((d) => d !== locale);
  return [locale, ...rest];
};

export const makeVisualizeDatasetFilter = (options?: {
  includeDrafts?: boolean;
  cubeIriVar?: string;
}) => {
  const cubeIriVar = options?.cubeIriVar ?? "?iri";
  const includeDrafts = options?.includeDrafts ?? false;

  return sparql`
    ${cubeIriVar} ${
    schema.workExample
  } <https://ld.admin.ch/application/visualize> .
    ${
      includeDrafts
        ? ""
        : sparql`${cubeIriVar} ${schema.creativeWorkStatus} <https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published> .`
    }
    ${cubeIriVar} ${cube.observationConstraint} ?shape .
    FILTER NOT EXISTS { ${cubeIriVar} ${schema.expires} ?expiryDate }`;
};
