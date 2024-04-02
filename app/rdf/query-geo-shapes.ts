import groupBy from "lodash/groupBy";
import { NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { MAX_BATCH_SIZE } from "@/graphql/context";
import {
  buildLocalizedSubQuery,
  formatIriToQueryNode,
} from "@/rdf/query-utils";

export interface GeoShape {
  iri: string;
  label: string;
  wktString?: string;
}

type GeoShapesLoaderProps = {
  locale: string;
  sparqlClient: ParsingClient;
  geoSparqlClient: ParsingClient;
};

/**
 * Creates a GeoShapes loader.
 *
 * @param dimensionIris IRIs of a GeoShape dimension's values
 */
export const createGeoShapesLoader = (props: GeoShapesLoaderProps) => {
  const { locale, sparqlClient, geoSparqlClient } = props;
  return async (dimensionIris: readonly string[]): Promise<GeoShape[]> => {
    const dimensionIriQueryNodes = dimensionIris.map(formatIriToQueryNode);
    const groupedLabels = await getGroupedLabels({
      queryNodes: dimensionIriQueryNodes,
      locale,
      sparqlClient,
    });
    const { geometries, groupedGeometries } = await getGeometries({
      queryNodes: dimensionIriQueryNodes,
      sparqlClient,
    });
    const groupedWktStrings = await getGroupedWktStrings({
      geometries,
      geoSparqlClient,
    });

    return dimensionIris.map((dimensionIri) => {
      let wktString: string | undefined;
      // There might be iris without geometries.
      const geometry = groupedGeometries[dimensionIri]?.[0]?.geometry;

      if (geometry) {
        wktString = groupedWktStrings[geometry]?.[0]?.wktString;
      }

      return {
        iri: dimensionIri,
        label: groupedLabels[dimensionIri]?.[0]?.label ?? dimensionIri,
        wktString,
      };
    });
  };
};

type RawLabel = {
  iri: NamedNode;
  label: NamedNode;
};

type GetLabelsProps = {
  queryNodes: string[];
  locale: string;
  sparqlClient: ParsingClient;
};

const getGroupedLabels = async (props: GetLabelsProps) => {
  const { queryNodes, locale, sparqlClient } = props;
  const query = `
PREFIX schema: <http://schema.org/>
SELECT ?iri ?label WHERE {
  VALUES ?iri { ${queryNodes.join("\n")} }
  ${buildLocalizedSubQuery("iri", "schema:name", "label", {
    locale,
  })}
}`;
  const result = (await sparqlClient.query
    .select(query, { operation: "postUrlencoded" })
    .catch((e) => {
      console.error(e);
      return [];
    })) as RawLabel[];

  return groupBy(result.map(parseLabel), (d) => d.iri);
};

type Label = {
  iri: string;
  label: string;
};

const parseLabel = (rawLabel: RawLabel): Label => {
  return {
    iri: rawLabel.iri.value,
    label: rawLabel.label?.value ?? rawLabel.iri.value,
  };
};

type RawGeometry = {
  iri: NamedNode;
  geometry: NamedNode;
};

type GetGroupedGeometriesProps = {
  queryNodes: string[];
  sparqlClient: ParsingClient;
};

const getGeometries = async (props: GetGroupedGeometriesProps) => {
  const { queryNodes, sparqlClient } = props;
  const query = `
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
SELECT ?iri ?geometry WHERE {
  VALUES ?iri { ${queryNodes.join("\n")} }
  ?iri geo:hasGeometry ?geometry
}`;
  const result = (await sparqlClient.query
    .select(query, { operation: "postUrlencoded" })
    .catch((e) => {
      console.error(e);
      return [];
    })) as RawGeometry[];
  const parsed = result.map(parseGeometry);

  return {
    geometries: parsed,
    groupedGeometries: groupBy(parsed, (d) => d.iri),
  };
};

type Geometry = {
  iri: string;
  geometry: string;
};

const parseGeometry = (rawGeometry: RawGeometry): Geometry => {
  return {
    iri: rawGeometry.iri.value,
    geometry: rawGeometry.geometry.value,
  };
};

type GetGroupedWktStringsProps = {
  geometries: Geometry[];
  geoSparqlClient: ParsingClient;
};

const getGroupedWktStrings = async (props: GetGroupedWktStringsProps) => {
  const { geometries, geoSparqlClient } = props;
  const geometryChunks: Geometry[][] = [];

  for (let i = 0; i < geometries.length; i += MAX_BATCH_SIZE * 0.5) {
    geometryChunks.push(geometries.slice(i, i + MAX_BATCH_SIZE * 0.5));
  }

  const rawWktStrings = (
    await Promise.all(
      geometryChunks.map(async (geometries) => {
        const iris = geometries.map(({ geometry }) => geometry);
        const queryNodes = iris.map(formatIriToQueryNode);
        return await getChunkWktStrings({ queryNodes, geoSparqlClient });
      })
    )
  ).flat();

  return groupBy(rawWktStrings.map(parseWktString), (d) => d.geometry);
};

type RawWktString = {
  geometry: NamedNode;
  wktString: NamedNode;
};

type GetChunkWktStringsProps = {
  queryNodes: string[];
  geoSparqlClient: ParsingClient;
};

const getChunkWktStrings = async (props: GetChunkWktStringsProps) => {
  const { queryNodes, geoSparqlClient } = props;
  const query = `
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
SELECT ?geometry ?wktString WHERE {
  VALUES ?geometry { ${queryNodes.join("\n")} }
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
