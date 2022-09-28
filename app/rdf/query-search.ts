import { DESCRIBE, SELECT, sparql } from "@tpluscode/sparql-builder";
import clownface from "clownface";
import { descending } from "d3";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { truthy } from "@/domain/types";
import { DataCubeSearchFilter } from "@/graphql/resolver-types";
import { ResolvedDataCube } from "@/graphql/shared-types";
import * as ns from "@/rdf/namespace";
import { parseCube, parseIri, parseVersionHistory } from "@/rdf/parse";
import { fromStream } from "@/rdf/sparql-client";

import { computeScores, highlight } from "./query-search-score-utils";

const toNamedNode = (x: string) => {
  return `<${x}>`;
};
const makeInFilter = (varName: string, values: string[]) => {
  return `
    ${
      values.length > 0
        ? `FILTER (
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

const makeVisualizeFilter = (includeDrafts: boolean) => {
  return sparql`
    ?cube ${ns.schema.workExample} <https://ld.admin.ch/application/visualize>.
    ?cube ${ns.schema.creativeWorkStatus} ?workStatus.
    
    ${
      !includeDrafts
        ? `
      FILTER (
        ?workStatus IN (<https://ld.admin.ch/vocabulary/CreativeWorkStatus/Published>)
        )`
        : ""
    }

    FILTER (
      NOT EXISTS { ?cube <http://schema.org/validThrough> ?validThrough . }
    )
    FILTER (
      NOT EXISTS { ?cube <http://schema.org/expires> ?expires . }
    )
  `;
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

const contains = (left: string, right: string) => {
  return `CONTAINS(LCASE(${left}), LCASE("${right}"))`;
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

  const scoresQuery = SELECT.DISTINCT`?cube ?versionHistory ?name ?description`
    .WHERE`
    ?cube a ${ns.cube.Cube}.
    ?cube ${ns.schema.name} ?name.

    
    ?cube ${ns.dcat.theme} ?theme.
    ?cube ${ns.dcterms.creator} ?creator.

    OPTIONAL {
      ?cube ${ns.schema.description} ?description.
    }
    
    OPTIONAL {
      ?cube ${ns.schema.about} ?about.
    }

    OPTIONAL {
      ?versionHistory ${ns.schema.hasPart} ?cube.
    }
    
    ${makeVisualizeFilter(!!includeDrafts)}

    ${makeInFilter("about", aboutValues)}
    ${makeInFilter("theme", themeValues)}
    ${makeInFilter("creator", creatorValues)}

      ${
        query
          ? `FILTER(
        ${query
          ?.split(" ")
          .slice(0, 1)
          .map(
            (x) => `${contains("?name", x)} || ${contains("?description", x)}`
          )
          .join(" || ")}
          
          )`
          : ""
      }

  `;

  const scoresQuery2 = SELECT.DISTINCT`?cube ?versionHistory ?publisher ?themeName ?creatorLabel`
    .WHERE`
    ?cube a ${ns.cube.Cube}.
    ?cube ${ns.schema.name} ?name.
    
    ?cube ${ns.dcat.theme} ?theme.
    ?cube ${ns.dcterms.creator} ?creator.
    
    OPTIONAL {
      ?cube ${ns.schema.about} ?about.
    }

    OPTIONAL {
      ?versionHistory ${ns.schema.hasPart} ?cube.
    }
    
    ${makeVisualizeFilter(!!includeDrafts)}

    ${makeInFilter("about", aboutValues)}
    ${makeInFilter("theme", themeValues)}
    ${makeInFilter("creator", creatorValues)}

    ${
      query && query.length > 0
        ? sparql`

        OPTIONAL {
          ?cube ${ns.dcterms.publisher} ?publisher.
          FILTER(${query
            .split(" ")
            .map((x) => contains("?publisher", x))
            .join(" || ")})  .
        }

        OPTIONAL {
          ?theme ${ns.schema.name} ?themeName.   
          FILTER(${query
            .split(" ")
            .map((x) => contains("?themeName", x))
            .join(" || ")})  .
        }


        OPTIONAL {

          ?creator ${ns.schema.name} ?creatorLabel.
          FILTER(${query
            .split(" ")
            .map((x) => contains("?creatorLabel", x))
            .join(" || ")})  .
        }
      `
        : ""
    }

  `;

  let scoreResults = await executeAndMeasure(sparqlClient, scoresQuery);
  queries.push({
    ...scoreResults.meta,
    label: "scores1",
  });

  if (scoreResults.data.length === 0) {
    scoreResults = await executeAndMeasure(sparqlClient, scoresQuery2);
    queries.push({
      ...scoreResults.meta,
      label: "scores2",
    });
  }

  const infoPerCube = computeScores(scoreResults.data, {
    query: query,
  });

  // Find information on cubes
  // Potential optimisation: filter out cubes that are below some threshold
  // under the maximum score and only retrieve those cubes
  // The query could also dedup directly the version of the cubes
  const cubeIris = Object.keys(infoPerCube);
  const cubesQuery = DESCRIBE`${cubeIris.map((x) => `<${x}>`).join(" ")}`;

  if (!locale) {
    throw new Error("Must pass locale");
  }

  const { data: cubeStream, meta: cubesMeta } = await executeAndMeasure(
    sparqlClientStream,
    cubesQuery
  );
  queries.push({
    ...cubesMeta,
    label: "cubes",
  });
  const cubeDataset = await fromStream(rdf.dataset(), cubeStream);
  const cf = clownface({ dataset: cubeDataset });

  const seen = new Set();
  const cubes = cf
    .has(
      cf.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
      ns.cube.Cube
    )
    .map((cubeNode) => {
      const cube = cubeNode as unknown as Cube;
      const iri = parseIri(cube);
      const versionHistory = parseVersionHistory(cube);
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
