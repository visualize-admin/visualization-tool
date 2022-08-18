import { DESCRIBE, SELECT, sparql } from "@tpluscode/sparql-builder";
import clownface from "clownface";
import { descending } from "d3";
import { Cube } from "rdf-cube-view-query";
import rdf from "rdf-ext";
import StreamClient from "sparql-http-client";
import ParsingClient from "sparql-http-client/ParsingClient";

import { DataCubeSearchFilter } from "@/graphql/resolver-types";
import * as ns from "@/rdf/namespace";
import { parseCube, parseIri, parseVersionHistory } from "@/rdf/parse";
import { fromStream } from "@/rdf/sparql-client";
import truthy from "@/utils/truthy";

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
type RdfValue<T> = {
  value: T;
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

export const searchCubes = async ({
  query,
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

  const scoresQuery = SELECT.DISTINCT`?cube ?versionHistory ?scoreName ?scoreDescription ?scoreTheme ?scorePublisher ?scoreCreator`
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
      { (?name ?scoreName) <tag:stardog:api:property:textMatch> "${query}". }
      UNION {
        OPTIONAL {
          ?cube ${ns.schema.description} ?description.
          (?description ?scoreDescription) <tag:stardog:api:property:textMatch> "${query}" .
        }
      }
      UNION  {
        OPTIONAL {
          ?cube ${ns.dcterms.publisher} ?publisher.
          (?publisher ?scorePublisher) <tag:stardog:api:property:textMatch> "${query}"  .
        }
      }
      UNION  {
        OPTIONAL {
          ?theme ${ns.schema.name} ?themeName.   
          (?themeName ?scoreTheme)
            <tag:stardog:api:property:textMatch> "${query}"  .
        }
      }
      UNION  {
        OPTIONAL {

          ?creator ${ns.schema.name} ?creatorLabel.
          (?creatorLabel ?scoreCreator)
            <tag:stardog:api:property:textMatch> "${query}"  .
        }
      }
      `
        : ""
    }

  `;

  const scoresRaw = await scoresQuery.execute(sparqlClient.query, {
    operation: "postUrlencoded",
  });

  const infoPerCube = computeScores(scoresRaw, {
    keepZeros: !query || query.length === 0,
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

  const cubeStream = await cubesQuery.execute(sparqlClientStream.query, {
    operation: "postUrlencoded",
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

  return results;
};
