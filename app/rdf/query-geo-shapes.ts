import { SELECT } from "@tpluscode/sparql-builder";
import groupBy from "lodash/groupBy";
import { NamedNode } from "rdf-js";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { MAX_BATCH_SIZE } from "@/graphql/context";
import { pragmas } from "@/rdf/create-source";
import * as ns from "@/rdf/namespace";
import { buildLocalizedSubQuery } from "@/rdf/query-utils";

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

/**
 * Creates a GeoShapes loader.
 *
 * @param dimensionIris IRIs of a GeoShape dimension's values
 */
export const createGeoShapesLoader =
  ({
    locale,
    sparqlClient,
    geoSparqlClient,
  }: {
    locale: string;
    sparqlClient: ParsingClient;
    geoSparqlClient: ParsingClient;
  }) =>
  async (dimensionIris: readonly string[]): Promise<RawGeoShape[]> => {
    const queryableIris = dimensionIris.map((d) => `<${d}>`);
    const labelsQuery = `PREFIX schema: <http://schema.org/>

SELECT ?iri ?label WHERE {
  VALUES ?iri { ${queryableIris.join("\n")} }
  ${buildLocalizedSubQuery("iri", "schema:name", "label", {
    locale,
    fallbackToNonLocalized: true,
  })}
}`;

    let rawLabels: RawLabel[] = [];

    try {
      rawLabels = (await sparqlClient.query.select(labelsQuery, {
        operation: "postUrlencoded",
      })) as RawLabel[];
    } catch (e) {
      console.error(e);
    }

    const groupedLabels = groupBy(
      rawLabels.map((d) => {
        return {
          iri: d.iri.value,
          label: d.label?.value ?? d.iri,
        };
      }),
      (d) => d.iri
    );

    const geometriesQuery = SELECT`?iri ?geometry`.WHERE`
        VALUES ?iri {
          ${queryableIris}
        }
        ?iri ${ns.geo.hasGeometry} ?geometry .`;

    const rawGeometries = (await geometriesQuery
      .execute(sparqlClient.query, {
        operation: "postUrlencoded",
      })
      .catch((e) => {
        console.error(e);
        return [];
      })) as RawGeometry[];

    const groupedGeometries = groupBy(
      rawGeometries.map((d) => {
        return {
          iri: d.iri.value,
          geometry: d.geometry.value,
        };
      }),
      (d) => d.iri
    );

    const rawWktStrings: RawWktString[] = [];
    const chunkedGeometries: RawGeometry[][] = [];

    for (let i = 0; i < rawGeometries.length; i += MAX_BATCH_SIZE * 0.5) {
      chunkedGeometries.push(rawGeometries.slice(i, i + MAX_BATCH_SIZE * 0.5));
    }

    await Promise.all(
      chunkedGeometries.map(async (geometries) => {
        let fetched: RawWktString[] = [];
        const wktStringsQuery = SELECT`?geometry ?wktString`.WHERE`
            VALUES ?geometry {
              ${geometries.map((d: any) => `<${d.geometry.value}>`)}
            }
      
            ?geometry ${ns.geo.asWKT} ?wktString .`.prologue`${pragmas}`;

        try {
          fetched = (await wktStringsQuery.execute(geoSparqlClient.query, {
            operation: "postUrlencoded",
          })) as RawWktString[];
        } catch (e) {
          console.error(e);
        }

        rawWktStrings.push(...fetched);
      })
    );

    const groupedWktStrings = groupBy(
      rawWktStrings.map((d) => {
        return {
          geometry: d.geometry.value,
          wktString: d.wktString.value,
        };
      }),
      (d) => d.geometry
    );

    return dimensionIris.map((iri) => {
      let wktString: string | undefined;
      // There might be iris without geometries.
      const geometry = groupedGeometries[iri]?.[0]?.geometry;

      if (geometry) {
        wktString = groupedWktStrings[geometry]?.[0]?.wktString;
      }

      return {
        iri,
        label: groupedLabels[iri]?.[0]?.label ?? iri,
        wktString,
      };
    });
  };
