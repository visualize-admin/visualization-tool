import { TemplateResult } from "@tpluscode/rdf-string/lib/TemplateResult";
import { DESCRIBE, SELECT, sparql } from "@tpluscode/sparql-builder";
import clownface from "clownface";
import { descending } from "d3";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Quad, Stream } from "rdf-js";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { truthy } from "@/domain/types";
import { Awaited } from "@/domain/types";
import { RequestQueryMeta } from "@/graphql/query-meta";
import { DataCubeSearchFilter } from "@/graphql/resolver-types";
import { ResolvedDataCube } from "@/graphql/shared-types";
import * as ns from "@/rdf/namespace";
import { parseCube, parseIri } from "@/rdf/parse";
import { fromStream } from "@/rdf/sparql-client";

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

const enhanceQuery = (rawQuery: string) => {
  const enhancedQuery = rawQuery
    .toLowerCase()
    .split(" ")
    // Filter out lowercase, small tokens
    .filter((t) => t.length > 2 || t.toLowerCase() !== t)
    // Wildcard Searches on each term
    .map((t) => `${t}`)
    .join(" ");
  return enhancedQuery;
};

const icontains = (left: string, right: string) => {
  return `CONTAINS(LCASE(${left}), LCASE("${right}"))`;
};

type ResultRow = Record<string, { value: unknown }>;
const parseResultRow = (row: ResultRow) =>
  Object.fromEntries(Object.entries(row).map(([k, v]) => [k, v.value]));

const identity = <T>(str: TemplateResult<T>) => str;
const optional = <T>(str: TemplateResult<T>) => sparql`OPTIONAL { ${str} }`;

const extractCubesFromStream = async (cubeStream: Stream<Quad>) => {
  const cubeDataset = await fromStream(rdf.dataset(), cubeStream);
  const cf = clownface({ dataset: cubeDataset });
  return cf.has(
    cf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
    ns.cube.Cube
  );
};

export const searchCubes = async ({
  query: rawQuery,
  locale,
  filters,
  includeDrafts,
  sparqlClient,
  sparqlClientStream,
}: {
  query?: string | null;
  locale?: string | null;
  filters?: DataCubeSearchFilter[] | null;
  includeDrafts?: Boolean | null;
  sparqlClient: ParsingClient;
  sparqlClientStream: StreamClient;
}) => {
  const queries = [] as RequestQueryMeta[];

  const query = rawQuery ? enhanceQuery(rawQuery) : undefined;

  // Search cubeIris along with their score
  const themeValues =
    filters?.filter((x) => x.type === "DataCubeTheme").map((v) => v.value) ||
    [];
  const creatorValues =
    filters
      ?.filter((x) => x.type === "DataCubeOrganization")
      .map((v) => v.value) || [];
  const aboutValues =
    filters?.filter((x) => x.type === "DataCubeAbout").map((v) => v.value) ||
    [];

  const scoresQuery = SELECT.DISTINCT`?cube ?versionHistory ?name ?description  ?publisher ?themeName ?creatorLabel`
    .WHERE`
    ?cube a ${ns.cube.Cube}.
    ?cube ${ns.schema.name} ?name.

    BIND(LANG(?name) as ?lang)

    OPTIONAL {
      ?cube ${ns.schema.description} ?description.
    }
    
    OPTIONAL {
      ?cube ${ns.schema.about} ?about.
    }

    OPTIONAL {
      ?versionHistory ${ns.schema.hasPart} ?cube.
    }

    OPTIONAL { ?cube ${ns.dcterms.publisher} ?publisher. }
    
    ${(themeValues.length > 0 ? identity : optional)(sparql`
      ?cube ${ns.dcat.theme} ?theme.
      ?theme ${ns.schema.name} ?themeName.
      `)}
    
    ${(creatorValues.length > 0 ? identity : optional)(
      sparql`
      ?cube ${ns.dcterms.creator} ?creator.
      ?creator ${ns.schema.name} ?creatorLabel. 
      `
    )}
    
    ${makeVisualizeDatasetFilter({
      includeDrafts: !!includeDrafts,
      cubeIriVar: "?cube",
    })}

    ${makeInFilter("about", aboutValues)}
    ${makeInFilter("theme", themeValues)}
    ${makeInFilter("creator", creatorValues)}

    FILTER(!BOUND(?description) || ?lang = LANG(?description))
    FILTER(!BOUND(?creatorLabel) || ?lang = LANG(?creatorLabel))
    FILTER(!BOUND(?themeName) || ?lang = LANG(?themeName))

      ${
        query
          ? `FILTER(
        ${query
          ?.split(" ")
          .slice(0, 1)
          .map(
            (x) => `${icontains("?name", x)} || ${icontains("?description", x)}`
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

  const data = scoreResults.data.map((x) => parseResultRow(x as ResultRow));
  const versionHistoryPerCube = Object.fromEntries(
    data.map((d) => [d.cube, d.versionHistory])
  );
  const infoPerCube = computeScores(data, {
    query: query,
    identifierName: "cube",
  });

  // Find information on cubes
  // Potential optimisation: filter out cubes that are below some threshold
  // under the maximum score and only retrieve those cubes
  // The query could also dedup directly the version of the cubes
  const cubeIris = Object.keys(infoPerCube);

  const sortedCubeIris = cubeIris.sort((a, b) =>
    descending(infoPerCube[a].score, infoPerCube[b].score)
  );

  const cubesQuery = DESCRIBE`${sortedCubeIris.map((x) => `<${x}>`).join(" ")}`;

  if (!locale) {
    throw new Error("Must pass locale");
  }

  const { data: cubeStream, meta: cubesMeta } =
    sortedCubeIris.length > 0
      ? await executeAndMeasure(sparqlClientStream, cubesQuery)
      : { data: undefined, meta: undefined };

  if (cubesMeta) {
    queries.push({
      ...cubesMeta,
      label: "cubes",
    });
  }
  const cubeNodes = cubeStream ? await extractCubesFromStream(cubeStream) : [];
  const seen = new Set();
  const cubes = cubeNodes
    .map((cubeNode) => {
      const cube = cubeNode as unknown as Cube;
      const iri = parseIri(cube);
      const versionHistory = versionHistoryPerCube[iri];
      const dedupIdentifier = versionHistory || iri;
      if (seen.has(dedupIdentifier)) {
        return null;
      }
      seen.add(dedupIdentifier);
      return parseCube({ cube: cube, locale });
    })
    .filter(truthy);

  // Sort the cubes per score using previously queries scores
  const results = cubes
    .filter((c): c is ResolvedDataCube => !!c?.data)
    .sort((a, b) =>
      descending(
        infoPerCube[a?.data.iri!].score,
        infoPerCube[b?.data.iri!].score
      )
    )
    .map((c) => ({
      dataCube: c,
      highlightedTitle: query ? highlight(c.data.title, query) : c.data.title,
      highlightedDescription: query
        ? highlight(c.data.description, query)
        : c.data.description,
    }));

  return {
    candidates: results,
    meta: {
      queries,
    },
  };
};

export type SearchResult = Awaited<
  ReturnType<typeof searchCubes>
>["candidates"][0];
