import { SELECT } from "@tpluscode/sparql-builder";
import { descending, group } from "d3";
import { Literal, NamedNode } from "rdf-js";
import ParsingClient from "sparql-http-client/ParsingClient";

import { SearchCube } from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  DataCubePublicationStatus,
  SearchCubeFilter,
} from "@/graphql/resolver-types";
import * as ns from "@/rdf/namespace";
import { locales } from "@/src";

import { pragmas } from "./create-source";
import { computeScores, highlight } from "./query-search-score-utils";
import { makeVisualizeDatasetFilter } from "./query-utils";

// Keep in sync with the query.
type RawSearchCube = {
  iri: NamedNode;
  title: Literal;
  description: Literal;
  status: NamedNode;
  datePublished: Literal;
  creatorIri: NamedNode;
  creatorLabel: Literal;
  publisher: NamedNode;
  themeIris: NamedNode;
  themeLabels: Literal;
  subthemeIris: NamedNode;
  subthemeLabels: Literal;
};

export type ParsedRawSearchCube = {
  [k in keyof RawSearchCube]: string;
};

const parseRawSearchCube = (cube: RawSearchCube): ParsedRawSearchCube => {
  return {
    iri: cube.iri.value,
    title: cube.title.value,
    description: cube.description?.value,
    status:
      cube.status.value ===
      ns.adminVocabulary("CreativeWorkStatus/Published").value
        ? DataCubePublicationStatus.Published
        : DataCubePublicationStatus.Draft,
    datePublished: cube.datePublished?.value,
    creatorIri: cube.creatorIri?.value,
    creatorLabel: cube.creatorLabel?.value,
    publisher: cube.publisher?.value,
    themeIris: cube.themeIris?.value,
    themeLabels: cube.themeLabels?.value,
    subthemeIris: cube.subthemeIris?.value,
    subthemeLabels: cube.subthemeLabels?.value,
  };
};

const getOrderedLocales = (locale: string) => {
  const rest = locales.filter((d) => d !== locale);
  return [locale, ...rest];
};

const buildLocalizedSubQuery = (
  s: string,
  p: string,
  o: string,
  { locale }: { locale: string }
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
      BIND(COALESCE(${locales
        .map((locale) => `?${o}_${locale}`)
        .join(", ")}) AS ?${o})
  `;
};

const makeInFilter = (name: string, values: string[]) => {
  return `
    ${
      values.length > 0
        ? `FILTER (bound(?${name}) && ?${name} IN (${values.map(
            (d) => `<${d}>`
          )}))`
        : ""
    }`;
};

const GROUP_SEPARATOR = "|||";

export const searchCubes = async ({
  query,
  locale: _locale,
  filters,
  includeDrafts,
  sparqlClient,
}: {
  query?: string | null;
  locale?: string | null;
  filters?: SearchCubeFilter[] | null;
  includeDrafts?: Boolean | null;
  sparqlClient: ParsingClient;
}) => {
  const locale = _locale ?? "de";
  // Search cubeIris along with their score
  const themeValues =
    filters?.filter((x) => x.type === "DataCubeTheme").map((v) => v.value) ??
    [];
  const creatorValues =
    filters
      ?.filter((x) => x.type === "DataCubeOrganization")
      .map((v) => v.value) ?? [];

  const scoresQuery = SELECT`
    ?iri ?title ?status ?datePublished ?description ?publisher ?creatorIri ?creatorLabel
    (GROUP_CONCAT(DISTINCT ?themeIri; SEPARATOR="${GROUP_SEPARATOR}") AS ?themeIris) (GROUP_CONCAT(DISTINCT ?themeLabel; SEPARATOR="${GROUP_SEPARATOR}") AS ?themeLabels)
    (GROUP_CONCAT(DISTINCT ?subthemeIri; SEPARATOR="${GROUP_SEPARATOR}") AS ?subthemeIris) (GROUP_CONCAT(DISTINCT ?subthemeLabel; SEPARATOR="${GROUP_SEPARATOR}") AS ?subthemeLabels)
    `.WHERE`
      ?iri a ${ns.cube.Cube} .
      ${buildLocalizedSubQuery("iri", "schema:name", "title", {
        locale,
      })}
      ${buildLocalizedSubQuery("iri", "schema:description", "description", {
        locale,
      })}
      OPTIONAL { ?iri ${ns.dcterms.publisher} ?publisher . }
      ?iri ${ns.schema.creativeWorkStatus} ?status .
      OPTIONAL { ?iri ${ns.schema.datePublished} ?datePublished . }

      OPTIONAL {
        ?iri ${ns.dcterms.creator} ?creatorIri .
        GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
          ?creatorIri a ${ns.schema.Organization} ;
            ${
              ns.schema.inDefinedTermSet
            } <https://register.ld.admin.ch/opendataswiss/org> .
            ${buildLocalizedSubQuery(
              "creatorIri",
              "schema:name",
              "creatorLabel",
              { locale }
            )}
        }
      }
      ${makeInFilter("creatorIri", creatorValues)}

      OPTIONAL {
        ?iri ${ns.dcat.theme} ?themeIri .
        GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
          ?themeIri a ${ns.schema.DefinedTerm} ;
          ${
            ns.schema.inDefinedTermSet
          } <https://register.ld.admin.ch/opendataswiss/category> .
          ${buildLocalizedSubQuery("themeIri", "schema:name", "themeLabel", {
            locale,
          })}
        }
      }
      ${makeInFilter("themeIri", themeValues)}

      # Add more subtheme termsets here when they are available
       ${
         creatorValues.includes(
           "https://register.ld.admin.ch/opendataswiss/org/bundesamt-fur-umwelt-bafu"
         )
           ? "VALUES (?subthemeGraph ?subthemeTermset) { (<https://lindas.admin.ch/foen/themes> <https://register.ld.admin.ch/foen/theme>) }"
           : ""
       }
      OPTIONAL {
        ?iri ${ns.schema.about} ?subthemeIri .
        GRAPH ?subthemeGraph {
          ?subthemeIri a ${ns.schema.DefinedTerm} ;
          ${ns.schema.inDefinedTermSet} ?subthemeTermset .
          ${buildLocalizedSubQuery(
            "subthemeIri",
            "schema:name",
            "subthemeLabel",
            { locale }
          )}
        }
      }

      ${makeVisualizeDatasetFilter({
        includeDrafts: !!includeDrafts,
        cubeIriVar: "?iri",
      })}

      ${
        query
          ? `
      VALUES ?keyword {${query
        .split(" ")
        .map((d) => `"${d}"`)
        .join(" ")}}

      FILTER(
        CONTAINS(LCASE(?title_de), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_fr), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_it), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_en), LCASE(?keyword)) ||
        CONTAINS(LCASE(?title_),   LCASE(?keyword)) ||
      
        CONTAINS(LCASE(?description_de), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_fr), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_it), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_en), LCASE(?keyword)) ||
        CONTAINS(LCASE(?description_),   LCASE(?keyword)) ||
          
        CONTAINS(LCASE(?creatorLabel_de), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_fr), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_it), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_en), LCASE(?keyword)) || 
        CONTAINS(LCASE(?creatorLabel_),   LCASE(?keyword)) || 
          
        CONTAINS(LCASE(?themeLabel_de), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_fr), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_it), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_en), LCASE(?keyword)) || 
        CONTAINS(LCASE(?themeLabel_),   LCASE(?keyword)) || 
          
        CONTAINS(LCASE(?subthemeLabel_de), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_fr), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_it), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_en), LCASE(?keyword)) || 
        CONTAINS(LCASE(?subthemeLabel_),   LCASE(?keyword)) || 
          
        CONTAINS(LCASE(?publisher), LCASE(?keyword))
      )`
          : ""
      }
      
  `.GROUP().BY`?iri`.THEN.BY`?title`.THEN.BY`?status`.THEN.BY`?datePublished`
    .THEN.BY`?description`.THEN.BY`?publisher`.THEN.BY`?creatorIri`.THEN
    .BY`?creatorLabel`.prologue`${pragmas}`;

  const scoreResults = await scoresQuery.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  });
  const rawCubes = (scoreResults as RawSearchCube[]).map(parseRawSearchCube);
  const rawCubesByIri = group(rawCubes, (d) => d.iri);
  const infoByCube = computeScores(rawCubes, { query });

  const seenCubes = new Set<string>();
  const cubes = rawCubes
    .map((cube) => {
      // Need to keep both published and draft cubes with the same iri.
      const dedupIdentifier = cube.iri + cube.status;

      if (seenCubes.has(dedupIdentifier)) {
        return null;
      }

      seenCubes.add(dedupIdentifier);

      const rawCubes = rawCubesByIri.get(cube.iri);

      if (!rawCubes?.length) {
        return null;
      }

      if (rawCubes.length > 1) {
        console.warn(`Found multiple cubes with the same iri: ${cube.iri}`);
      }

      const rawCube = rawCubes[0];

      const themeIris = rawCube.themeIris.split(GROUP_SEPARATOR);
      const themeLabels = rawCube.themeLabels.split(GROUP_SEPARATOR);
      const subthemeIris = rawCube.subthemeIris.split(GROUP_SEPARATOR);
      const subthemeLabels = rawCube.subthemeLabels.split(GROUP_SEPARATOR);

      const parsedCube: SearchCube = {
        iri: rawCube.iri,
        title: rawCube.title,
        description: rawCube.description,
        creator:
          rawCube.creatorIri && rawCube.creatorLabel
            ? { iri: rawCube.creatorIri, label: rawCube.creatorLabel }
            : null,
        publicationStatus: rawCube.status as DataCubePublicationStatus,
        datePublished: rawCube.datePublished,
        themes:
          themeIris.length === themeLabels.length
            ? themeIris.map((iri, i) => ({
                iri,
                label: themeLabels[i],
              }))
            : [],
        subthemes:
          subthemeIris.length === subthemeLabels.length
            ? subthemeIris.map((iri, i) => ({
                iri,
                label: subthemeLabels[i],
              }))
            : [],
      };

      return parsedCube;
    })
    .filter(truthy);

  return cubes
    .sort((a, b) =>
      descending(infoByCube[a.iri].score, infoByCube[b.iri].score)
    )
    .map((cube) => ({
      cube,
      highlightedTitle: query ? highlight(cube.title, query) : cube.title,
      highlightedDescription:
        query && cube.description
          ? highlight(cube.description, query)
          : cube.description,
    }));
};

export type SearchResult = Awaited<ReturnType<typeof searchCubes>>[0];
