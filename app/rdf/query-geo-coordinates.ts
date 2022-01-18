import { SELECT } from "@tpluscode/sparql-builder";
import { ResolvedDimension } from "../graphql/shared-types";
import * as ns from "./namespace";
import { dimensionIsVersioned } from "./queries";
import { sparqlClient } from "./sparql-client";

export interface RawGeoCoordinates {
  iri: string;
  label: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Creates a GeoCoordinates loader.
 */
export const createGeoCoordinatesLoader =
  ({ locale }: { locale: string }) =>
  async (dimensions: readonly ResolvedDimension[]) => {
    const result: RawGeoCoordinates[][] = [];

    for (const dimension of dimensions) {
      const isVersioned = dimensionIsVersioned(dimension.dimension);

      const query = SELECT.DISTINCT`?dimension ?label ?latitude ?longitude`
        .WHERE`
        ${dimension.cube.term} ${ns.cube.observationSet} ?observationSet .
        ?observationSet ${ns.cube.observation} ?observation .
        ?observation ${dimension.dimension.path} ${
        isVersioned
          ? `?dimension_versioned . ?dimension_versioned schema:sameAs ?dimension ;`
          : `?dimension`
      }
          ${ns.schema.latitude} ?latitude ;
          ${ns.schema.longitude} ?longitude .

        OPTIONAL {
          ${isVersioned ? "?dimension_versioned" : "?dimension"} ${
        ns.schema.name
      } ?label .
          FILTER(LANG(?label) = '${locale}')
        }

        OPTIONAL {
          ${isVersioned ? "?dimension_versioned" : "?dimension"} ${
        ns.schema.name
      } ?label .
        }
      `;

      let fetchedGeoCoordinates: any[] = [];

      try {
        fetchedGeoCoordinates = await query.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      result.push(
        fetchedGeoCoordinates.map((d) => ({
          iri: d.dimension.value,
          label: d.label.value,
          latitude: +d.latitude.value,
          longitude: +d.longitude.value,
        }))
      );
    }

    return result;
  };
