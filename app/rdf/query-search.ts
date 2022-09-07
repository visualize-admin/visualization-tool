import { DESCRIBE, SELECT, sparql } from "@tpluscode/sparql-builder";
import clownface from "clownface";
import { descending } from "d3";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { truthy } from "@/domain/types";
import { DataCubeSearchFilter } from "@/graphql/resolver-types";
import * as ns from "@/rdf/namespace";
import { parseCube, parseIri, parseVersionHistory } from "@/rdf/parse";
import { fromStream } from "@/rdf/sparql-client";

import { computeScores } from "./query-search-score-utils";

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
  return (
    rawQuery
      .toLowerCase()
      .split(" ")
      .filter((x) => x.toUpperCase() === x || x.length > 2)
      // Wildcard Searches on each term
      .map((t) => `${t}*`)
      .join(" ")
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
  const queriesMeta = [] as RequestQueryMeta[];

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

  const words = query?.split(" ");

  const makeSearchQuery = (q?: string) =>
    SELECT.DISTINCT`?cube ?versionHistory ?scoreName ?scoreDescription ?scoreTheme ?scorePublisher ?scoreCreator`
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
      q && q.length > 0
        ? sparql`
      { (?name ?scoreName) <tag:stardog:api:property:textMatch> "${q}". }
      UNION {
        OPTIONAL {
          ?cube ${ns.schema.description} ?description.
          (?description ?scoreDescription) <tag:stardog:api:property:textMatch> "${q}" .
        }
      }
      UNION  {
        OPTIONAL {
          ?cube ${ns.dcterms.publisher} ?publisher.
          (?publisher ?scorePublisher) <tag:stardog:api:property:textMatch> "${q}"  .
        }
      }
      UNION  {
        OPTIONAL {
          ?theme ${ns.schema.name} ?themeName.   
          (?themeName ?scoreTheme)
            <tag:stardog:api:property:textMatch> "${q}"  .
        }
      }
      UNION  {
        OPTIONAL {

          ?creator ${ns.schema.name} ?creatorLabel.
          (?creatorLabel ?scoreCreator)
            <tag:stardog:api:property:textMatch> "${q}"  .
        }
      }
      `
        : ""
    }

  `;

  const queries = words
    ? words.map((w) => makeSearchQuery(w))
    : [makeSearchQuery()];

  const infoPerCube: ReturnType<typeof computeScores> = {};
  const resultsPerWord = await Promise.all(
    queries.map((scoresQuery) => executeAndMeasure(sparqlClient, scoresQuery))
  );

  for (const { meta: scoresMeta, data: scoresRaw } of resultsPerWord) {
    queriesMeta.push({
      ...scoresMeta,
      label: "scores",
    });
    const infoPerCubeForWord = computeScores(scoresRaw, {
      keepZeros: !query || query.length === 0,
    });
    for (const [cubeIri, { score, highlights }] of Object.entries(
      infoPerCubeForWord
    )) {
      if (infoPerCube[cubeIri]) {
        infoPerCube[cubeIri].score += score;
      } else {
        infoPerCube[cubeIri] = { score, highlights };
      }
    }
  }

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
  queriesMeta.push({
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
    .filter((c) => !!c?.data)
    .sort((a, b) =>
      descending(
        infoPerCube[a?.data.iri!].score,
        infoPerCube[b?.data.iri!].score
      )
    )
    .map((c) => ({
      dataCube: c,

      // TODO Retrieve highlights
      highlightedTitle: c!.data.title,
      highlightedDescription: c!.data.description,
    }));

  return {
    candidates: results,
    meta: {
      queries: queriesMeta,
    },
  };
};
