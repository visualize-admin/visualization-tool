import { rollup } from "d3-array";
import { NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { MAX_BATCH_SIZE } from "@/graphql/context";
import { iriToNode } from "@/rdf/query-utils";

export interface GeoShape {
  geometryIri: string;
  wktString?: string;
}

type GeoShapesLoaderProps = {
  geoSparqlClient: ParsingClient;
};

/**
 * Creates a GeoShapes loader.
 *
 * @param dimensionIris IRIs of a GeoShape dimension's values
 */
export const createGeoShapesLoader = (props: GeoShapesLoaderProps) => {
  const { geoSparqlClient } = props;
  return async (geometryIris: readonly string[]): Promise<GeoShape[]> => {
    const geometryIriQueryNodes = geometryIris.map(iriToNode);
    const wktStringsByGeometry = await getWktStringsByGeometry({
      geometryIriQueryNodes,
      geoSparqlClient,
    });

    return geometryIris.map((geometryIri) => {
      return {
        geometryIri,
        wktString: wktStringsByGeometry.get(geometryIri),
      };
    });
  };
};

type GetGroupedWktStringsProps = {
  geometryIriQueryNodes: string[];
  geoSparqlClient: ParsingClient;
};

const getWktStringsByGeometry = async (props: GetGroupedWktStringsProps) => {
  const { geometryIriQueryNodes, geoSparqlClient } = props;
  const geometryIriChunks: string[][] = [];

  for (let i = 0; i < geometryIriQueryNodes.length; i += MAX_BATCH_SIZE * 0.5) {
    geometryIriChunks.push(
      geometryIriQueryNodes.slice(i, i + MAX_BATCH_SIZE * 0.5)
    );
  }

  const rawWktStrings = (
    await Promise.all(
      geometryIriChunks.map(async (geometryIris) => {
        return await getChunkWktStrings({ geometryIris, geoSparqlClient });
      })
    )
  ).flat();

  return rollup(
    rawWktStrings.map(parseWktString),
    (v) => v[0].wktString,
    (d) => d.geometry
  );
};

type RawWktString = {
  geometry: NamedNode;
  wktString: NamedNode;
};

type GetChunkWktStringsProps = {
  geometryIris: string[];
  geoSparqlClient: ParsingClient;
};

const getChunkWktStrings = async (props: GetChunkWktStringsProps) => {
  const { geometryIris, geoSparqlClient } = props;
  const query = `
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
SELECT ?geometry ?wktString WHERE {
  VALUES ?geometry { ${geometryIris.join("\n")} }
  ?geometry geo:asWKT ?wktString
}`;

  return (await geoSparqlClient.query
    .select(query, { operation: "postUrlencoded" })
    .catch((e) => {
      console.error(e);
      return [];
    })) as RawWktString[];
};

const parseWktString = (rawWktString: RawWktString) => {
  return {
    geometry: rawWktString.geometry.value,
    wktString: rawWktString.wktString.value,
  };
};
