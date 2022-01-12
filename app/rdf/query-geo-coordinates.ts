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
const loadGeoCoordinates = async (dimension: ResolvedDimension) => {
  const isVersioned = dimensionIsVersioned(dimension.dimension);

  const query = SELECT.DISTINCT`?dimension ?label ?latitude ?longitude`.WHERE`
    ${dimension.cube.term} ${ns.cube.observationSet} ?observationSet .
    ?observationSet ${ns.cube.observation} ?observation .
    ?observation ${dimension.dimension.path} ${
    isVersioned
      ? `?dimension_versioned . ?dimension_versioned schema:sameAs ?dimension ;`
      : `?dimension`
  }
      ${ns.schema.name} ?label ;
      ${ns.schema.latitude} ?latitude ;
      ${ns.schema.longitude} ?longitude .
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
    iri: d.dimension.value,
    label: d.label.value,
    latitude: d.latitude.value,
    longitude: d.longitude.value,
  }));
};

export const createGeoCoordinatesLoader =
  () => async (dimensions: readonly ResolvedDimension[]) => {
    const result: RawGeoCoordinates[][] = [];

    for (const dimension of dimensions) {
      const geoCoordinates = await loadGeoCoordinates(dimension);
      result.push(geoCoordinates);
    }

    return result;
  };
