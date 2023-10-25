import { TemplateResult } from "@tpluscode/rdf-string/lib/TemplateResult";
import { DESCRIBE, SELECT, sparql } from "@tpluscode/sparql-builder";
import { descending, group, rollup } from "d3";
import { Literal, NamedNode } from "rdf-js";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { truthy } from "@/domain/types";
import { RequestQueryMeta } from "@/graphql/query-meta";
import {
  DataCubePublicationStatus,
  SearchCubeFilter,
} from "@/graphql/resolver-types";
import * as ns from "@/rdf/namespace";
import { fromStream } from "@/rdf/sparql-client";
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

// It's a bit difficult ot access the types of the various sparql libraries
const exampleSelectQuery = SELECT``;
const exampleDescribeQuery = DESCRIBE``;
type SelectQuery = typeof exampleSelectQuery;
type DescribeQuery = typeof exampleDescribeQuery;
type StreamOfQuad = Parameters<typeof fromStream>[1];

const executeAndMeasure = async <T extends SelectQuery | DescribeQuery>(
  client: T extends SelectQuery ? ParsingClient : StreamClient,
  query: T
): Promise<{
  meta: RequestQueryMeta;
  data: T extends SelectQuery ? unknown[] : StreamOfQuad;
}> => {
  const startTime = Date.now();
  // @ts-ignore
  const data = await query.execute(client.query, {
    operation: "postUrlencoded",
  });
  const endTime = Date.now();
  return {
    meta: {
      startTime,
      endTime,
      text: query.build(),
    },
    data,
  };
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
  publicationStatus: NamedNode;
  datePublished: Literal;
  creator: NamedNode;
  creatorLabel: Literal;
  publisher: NamedNode;
  theme: NamedNode;
  themeName: Literal;
  lang: Literal;
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
    publicationStatus:
      cube.publicationStatus.value ===
      ns.adminVocabulary("CreativeWorkStatus/Published").value
        ? DataCubePublicationStatus.Published
        : DataCubePublicationStatus.Draft,
    datePublished: cube.datePublished?.value,
    creator: cube.creator?.value,
    creatorLabel: cube.creatorLabel?.value,
    publisher: cube.publisher?.value,
    theme: cube.theme?.value,
    themeName: cube.themeName?.value,
    lang: cube.lang.value,
  };
};

const identity = <T>(str: TemplateResult<T>) => str;
const optional = <T>(str: TemplateResult<T>) => sparql`OPTIONAL { ${str} }`;

const getCubesByLocale = (
  rawGroupedCubesByLocale: Map<string, ParsedRawSearchCube[]>,
  locale: string
) => {
  const rest = locales.filter((d) => d !== locale);
  const orderedLocales = [locale, ...rest];

  for (const orderedLocale of orderedLocales) {
    const cubes = rawGroupedCubesByLocale.get(orderedLocale);

    if (cubes) {
      return cubes;
    }
  }
};

export const searchCubes = async ({
  query,
  locale,
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
  const queries = [] as RequestQueryMeta[];

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

  const scoresQuery = SELECT.DISTINCT`?lang ?iri ?title ?publicationStatus ?datePublished ?versionHistory ?description ?publisher ?theme ?themeName ?creator ?creatorLabel`
    .WHERE`
    ?iri a ${ns.cube.Cube} .
    ?iri ${ns.schema.name} ?title .

    BIND(LANG(?title) as ?lang)

    OPTIONAL { ?iri ${ns.schema.description} ?description . }
    
    OPTIONAL { ?iri ${ns.schema.about} ?about .}

    OPTIONAL { ?versionHistory ${ns.schema.hasPart} ?iri . }

    OPTIONAL { ?iri ${ns.dcterms.publisher} ?publisher . }

    OPTIONAL { ?iri ${ns.schema.creativeWorkStatus} ?publicationStatus . }

    OPTIONAL { ?iri ${ns.schema.datePublished} ?datePublished . }
    
    ${(themeValues.length > 0 ? identity : optional)(sparql`
      ?iri ${ns.dcat.theme} ?theme.
      ?theme ${ns.schema.name} ?themeName.
    `)}
    
    ${makeVisualizeDatasetFilter({
      includeDrafts: !!includeDrafts,
      cubeIriVar: "?iri",
    })}

    ${makeInFilter("about", aboutValues)}
    ${makeInFilter("theme", themeValues)}
    ${makeInFilter("creator", creatorValues)}

    FILTER(!BOUND(?description) || ?lang = LANG(?description))
    FILTER(!BOUND(?themeName) || ?lang = LANG(?themeName))

    ${(creatorValues.length > 0 ? identity : optional)(sparql`
      ?iri ${ns.dcterms.creator} ?creator .
      GRAPH <https://lindas.admin.ch/sfa/opendataswiss> {
        ?creator a ${ns.schema.Organization} ;
          ${ns.schema.inDefinedTermSet} <https://register.ld.admin.ch/opendataswiss/org> .
        OPTIONAL {
          ?creator ${ns.schema.name} ?creatorLabel .
          FILTER(!BOUND(?creatorLabel) || LANG(?creatorLabel) = ?lang)
        }
      }
    `)}

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
        
      ||  (bound(?themeName) && ${query
        .split(" ")
        .map((x) => icontains("?themeName", x))
        .join(" || ")})
        
      ||  (bound(?creatorLabel) && ${query
        .split(" ")
        .map((x) => icontains("?creatorLabel", x))
        .join(" || ")})
      )`
          : ""
      }
  `.prologue`${pragmas}`;

  const scoreResults = await executeAndMeasure(sparqlClient, scoresQuery);
  queries.push({
    ...scoreResults.meta,
    label: "scores1",
  });

  const rawCubes = (scoreResults.data as RawSearchCube[]).map(
    parseRawSearchCube
  );
  const rawCubesByIriAndLang = rollup(
    rawCubes,
    (v) => group(v, (d) => d.lang),
    (d) => d.iri
  );
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

      const rawCubeByLang = rawCubesByIriAndLang.get(cube.iri);

      if (!rawCubeByLang) {
        return null;
      }

      const localizedCubes = getCubesByLocale(rawCubeByLang, locale);

      if (!localizedCubes) {
        return null;
      }

      const parsedCube: any = {
        iri: null,
        title: null,
        description: null,
        creator: null,
        publicationStatus: null,
        datePublished: null,
        themes: [],
      };

      for (const cube of localizedCubes) {
        if (!parsedCube.iri) {
          parsedCube.iri = cube.iri;
        }

        if (!parsedCube.title) {
          parsedCube.title = cube.title;
        }

        if (!parsedCube.description) {
          parsedCube.description = cube.description;
        }

        if (!parsedCube.creator && cube.creator) {
          parsedCube.creator = {
            iri: cube.creator,
            label: cube.creatorLabel,
          };
        }

        if (!parsedCube.datePublished) {
          parsedCube.datePublished = cube.datePublished;
        }

        if (!parsedCube.publisher) {
          parsedCube.publisher = cube.publisher;
        }

        if (!parsedCube.publicationStatus) {
          parsedCube.publicationStatus = cube.publicationStatus;
        }

        if (cube.theme || cube.themeName) {
          parsedCube.themes.push({
            iri: cube.theme,
            name: cube.themeName,
          });
        }
      }

      return parsedCube;
    })
    .filter(truthy);

  const candidates = cubes
    .sort((a, b) =>
      descending(infoByCube[a.iri].score, infoByCube[b.iri].score)
    )
    .map((cube) => ({
      cube,
      highlightedTitle: query ? highlight(cube.title, query) : cube.title,
      highlightedDescription: query
        ? highlight(cube.description, query)
        : cube.description,
    }));

  return {
    candidates,
    meta: {
      queries,
    },
  };
};

export type SearchResult = Awaited<
  ReturnType<typeof searchCubes>
>["candidates"][0];
