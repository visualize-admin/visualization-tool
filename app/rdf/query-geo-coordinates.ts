import { SELECT } from "@tpluscode/sparql-builder";
import * as ns from "./namespace";
import { sparqlClient } from "./sparql-client";

export interface RawGeoCoordinates {
  iri: string;
  label: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Creates a GeoCoordinates loader.
 *
 * @param dimensionValues IRIs of a GeoCoordinates dimension's values
 */
export const createGeoCoordinatesLoader =
  ({ locale }: { locale: string }) =>
  async (dimensionValues?: readonly string[]): Promise<RawGeoCoordinates[]> => {
    if (dimensionValues) {
      const query = SELECT`?geoCoordinateIri ?label ?latitude ?longitude`.WHERE`
        VALUES ?geoCoordinateIri {
          ${dimensionValues}
        }

        OPTIONAL {
          ?geoCoordinateIri ${ns.schema.name} ?label
        }

        OPTIONAL {
          ?geoCoordinateIri ${ns.schema.latitude} ?latitude
        }

        OPTIONAL {
          ?geoCoordinateIri ${ns.schema.longitude} ?longitude
        }

        FILTER(LANG(?label) = '${locale}')
      `;

      let result: any[] = [];
      try {
        result = await query.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      return result.map((d) => ({
        iri: d.geoCoordinateIri.value,
        label: d.label.value,
        latitude: d.latitude,
        longitude: d.longitude,
      }));
    } else {
      return [];
    }
  };
