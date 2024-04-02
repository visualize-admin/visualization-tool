import groupBy from "lodash/groupBy";
import { NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { MAX_BATCH_SIZE } from "@/graphql/context";
import {
  buildLocalizedSubQuery,
  formatIriToQueryNode,
} from "@/rdf/query-utils";

export interface RawGeoShape {
  iri: string;
  label: string;
  wktString?: string;
}

type RawLabel = {
  iri: NamedNode;
  label: NamedNode;
};

type RawGeometry = {
  iri: NamedNode;
  geometry: NamedNode;
};

type RawWktString = {
  geometry: NamedNode;
  wktString: NamedNode;
};

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
  return async (dimensionIris: readonly string[]): Promise<RawGeoShape[]> => {
    const dimensionIriQueryNodes = dimensionIris.map(formatIriToQueryNode);
    const labelsQuery = `
  PREFIX schema: <http://schema.org/>
  SELECT ?iri ?label WHERE {
    VALUES ?iri { ${dimensionIriQueryNodes.join("\n")} }
    ${buildLocalizedSubQuery("iri", "schema:name", "label", {
      locale,
    })}
  }`;
    const rawLabels = (await sparqlClient.query
      .select(labelsQuery, { operation: "postUrlencoded" })
      .catch((e) => {
        console.error(e);
        return [];
      })) as RawLabel[];
    const groupedLabels = groupBy(
      rawLabels.map((rawLabel) => {
        const iri = rawLabel.iri.value;
        return {
          iri,
          label: rawLabel.label?.value ?? iri,
        };
      }),
      (d) => d.iri
    );

    const geometriesQuery = `
  PREFIX geo: <http://www.opengis.net/ont/geosparql#>
  SELECT ?iri ?geometry WHERE {
    VALUES ?iri { ${dimensionIriQueryNodes.join("\n")} }
    ?iri geo:hasGeometry ?geometry
  }`;
    const rawGeometries = (await sparqlClient.query
      .select(geometriesQuery, { operation: "postUrlencoded" })
      .catch((e) => {
        console.error(e);
        return [];
      })) as RawGeometry[];
    const groupedGeometries = groupBy(
      rawGeometries.map((rawGeometry) => {
        return {
          iri: rawGeometry.iri.value,
          geometry: rawGeometry.geometry.value,
        };
      }),
      (d) => d.iri
    );

    const chunkedRawGeometries: RawGeometry[][] = [];

    for (let i = 0; i < rawGeometries.length; i += MAX_BATCH_SIZE * 0.5) {
      chunkedRawGeometries.push(
        rawGeometries.slice(i, i + MAX_BATCH_SIZE * 0.5)
      );
    }

    const rawWktStrings = (
      await Promise.all(
        chunkedRawGeometries.map(async (rawGeometries) => {
          const rawGeometryQueryNodes = rawGeometries.map((rawGeometry) =>
            formatIriToQueryNode(rawGeometry.geometry.value)
          );
          const query = `
  PREFIX geo: <http://www.opengis.net/ont/geosparql#>
  SELECT ?geometry ?wktString WHERE {
    VALUES ?geometry { ${rawGeometryQueryNodes.join("\n")} }
    ?geometry geo:asWKT ?wktString
  }`;

          return (await geoSparqlClient.query
            .select(query, { operation: "postUrlencoded" })
            .catch((e) => {
              console.error(e);
              return [];
            })) as RawWktString[];
        })
      )
    ).flat();
    const groupedWktStrings = groupBy(
      rawWktStrings.map((rawWktString) => {
        return {
          geometry: rawWktString.geometry.value,
          wktString: rawWktString.wktString.value,
        };
      }),
      (d) => d.geometry
    );

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
