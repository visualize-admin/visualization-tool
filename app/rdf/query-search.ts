import RDF from "@rdfjs/data-model";
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

const toNamedNode = (x: string) => {
  return `<${x}>`;
};
const makeInFilter = (varName: string, values: string[]) => {
  return `
    ${
      values.length > 0
        ? `FILTER (bound(?${varName}) &&
    ?${varName} IN (${values.map(toNamedNode)})
  )`
        : ""
    }`;
};

const icontains = (left: string, right: string) => {
  return `CONTAINS(LCASE(${left}), LCASE("${right}"))`;
};

// Keep in sync with the query.
type RawSearchCube = {
  iri: NamedNode;
  title: Literal;
  description: Literal;
  versionHistory: NamedNode;
  status: NamedNode;
  datePublished: Literal;
  creatorIri: NamedNode;
  creatorLabel: Literal;
  publisher: NamedNode;
  themeIri: NamedNode;
  themeLabel: Literal;
};

export type ParsedRawSearchCube = {
  [k in keyof RawSearchCube]: string;
};

const parseRawSearchCube = (cube: RawSearchCube): ParsedRawSearchCube => {
  return {
    iri: cube.iri.value,
    title: cube.title.value,
    description: cube.description?.value,
    versionHistory: cube.versionHistory?.value,
    status:
      cube.status.value ===
      ns.adminVocabulary("CreativeWorkStatus/Published").value
        ? DataCubePublicationStatus.Published
        : DataCubePublicationStatus.Draft,
    datePublished: cube.datePublished?.value,
    creatorIri: cube.creatorIri?.value,
    creatorLabel: cube.creatorLabel?.value,
    publisher: cube.publisher?.value,
    themeIri: cube.themeIri?.value,
    themeLabel: cube.themeLabel?.value,
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
  const aboutValues =
    filters?.filter((x) => x.type === "DataCubeAbout").map((v) => v.value) ??
    [];

  const scoresQuery = SELECT.DISTINCT`?iri ?title ?status ?datePublished ?versionHistory ?description ?publisher ?themeIri ?themeLabel ?creatorIri ?creatorLabel`
    .WHERE`
      ?iri a ${ns.cube.Cube} .
      ${buildLocalizedSubQuery("iri", "schema:name", "title", {
        locale,
      })}
      ${buildLocalizedSubQuery("iri", "schema:description", "description", {
        locale,
      })}
      OPTIONAL { ?versionHistory ${ns.schema.hasPart} ?iri . }
      OPTIONAL { ?iri ${ns.schema.about} ?aboutIri . }
      OPTIONAL { ?iri ${ns.dcterms.publisher} ?publisher . }
      OPTIONAL { ?iri ${ns.schema.creativeWorkStatus} ?status . }
      OPTIONAL {
        ?iri ${ns.schema.datePublished} ?datePublished .
        FILTER(DATATYPE(?datePublished) = ${ns.xsd.date})
      }
      OPTIONAL {
        ?iri ${ns.dcat.theme} ?themeIri .
        ${buildLocalizedSubQuery("themeIri", "schema:name", "themeLabel", {
          locale,
        })}
      }
      ${makeVisualizeDatasetFilter({
        includeDrafts: !!includeDrafts,
        cubeIriVar: "?iri",
      })}
      ${makeInFilter("aboutIri", aboutValues)}
      ${makeInFilter("themeIri", themeValues)}
      ${makeInFilter("creatorIri", creatorValues)}
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
      ${
        query
          ? `FILTER(
        ${query
          ?.split(" ")
          .slice(0, 1)
          .map(
            (x) =>
              `${icontains("?title", x)} || ${icontains("?description", x)}`
          )
          .join(" || ")}

      || (bound(?publisher) && ${query
        .split(" ")
        .map((x) => icontains("?publisher", x))
        .join(" || ")})
        
      ||  (bound(?themeLabel) && ${query
        .split(" ")
        .map((x) => icontains("?themeLabel", x))
        .join(" || ")})
        
      ||  (bound(?creatorLabel) && ${query
        .split(" ")
        .map((x) => icontains("?creatorLabel", x))
        .join(" || ")})
      )`
          : ""
      }
  `
    .ORDER()
    // Important for the latter part of the query, to return the latest cube per unversioned iri.
    .BY(RDF.variable("versionHistory"))
    .THEN.BY(RDF.variable("iri"), true).prologue`${pragmas}`;

  const scoreResults = await scoresQuery.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  });
  const rawCubes = (scoreResults as RawSearchCube[]).map(parseRawSearchCube);
  const rawCubesByIri = group(rawCubes, (d) => d.iri);
  const versionHistoryPerCube = Object.fromEntries(
    rawCubes.map((d) => [d.iri, d.versionHistory])
  );
  const infoByCube = computeScores(rawCubes, {
    query,
    locale,
  });

  if (!locale) {
    throw new Error("Must pass locale");
  }

  const seen = new Set<string>();
  const cubes = rawCubes
    .map((cube) => {
      const versionHistory = versionHistoryPerCube[cube.iri];
      const dedupIdentifier = versionHistory ?? cube.iri;

      if (seen.has(dedupIdentifier)) {
        return null;
      }

      seen.add(dedupIdentifier);

      const rawCubes = rawCubesByIri.get(cube.iri);

      if (!rawCubes?.length) {
        return null;
      }

      const parsedCube: SearchCube = {
        iri: rawCubes[0].iri,
        title: rawCubes[0].title,
        description: null,
        creator: null,
        publicationStatus: rawCubes[0].status as DataCubePublicationStatus,
        datePublished: null,
        themes: [],
      };

      for (const cube of rawCubes) {
        if (!parsedCube.iri) {
          parsedCube.iri = cube.iri;
        }

        if (!parsedCube.title) {
          parsedCube.title = cube.title;
        }

        if (!parsedCube.description) {
          parsedCube.description = cube.description;
        }

        if (!parsedCube.creator && cube.creatorIri) {
          parsedCube.creator = {
            iri: cube.creatorIri,
            label: cube.creatorLabel,
          };
        }

        if (!parsedCube.datePublished) {
          parsedCube.datePublished = cube.datePublished;
        }

        if (!parsedCube.publicationStatus) {
          parsedCube.publicationStatus =
            cube.status as DataCubePublicationStatus;
        }

        if (cube.themeIri && cube.themeLabel) {
          parsedCube.themes.push({
            iri: cube.themeIri,
            label: cube.themeLabel,
          });
        }
      }

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
