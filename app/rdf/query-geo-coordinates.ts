import { SELECT, sparql } from "@tpluscode/sparql-builder";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { GeoCoordinates } from "@/domain/data";
import { ResolvedDimension } from "@/graphql/shared-types";
import { pragmas } from "@/rdf/create-source";
import * as ns from "@/rdf/namespace";
import { dimensionIsVersioned } from "@/rdf/queries";

/**
 * Creates a GeoCoordinates loader.
 */
export const createGeoCoordinatesLoader =
  ({ locale, sparqlClient }: { locale: string; sparqlClient: ParsingClient }) =>
  async (
    dimensions: readonly ResolvedDimension[]
  ): Promise<GeoCoordinates[]> => {
    return Promise.all(
      dimensions.map(async (dimension) => {
        const isVersioned = dimensionIsVersioned(dimension.dimension);
        const query = SELECT.DISTINCT`?dimension ?label ?latitude ?longitude`
          .WHERE`
        ${dimension.cube.term} ${ns.cube.observationSet} ?observationSet .
        ?observationSet ${ns.cube.observation} ?observation .
        ?observation ${dimension.dimension.path} ${
          isVersioned
            ? `?dimension_versioned . ?dimension_versioned ${sparql`${ns.schema.sameAs}`.toString(
                { prologue: false }
              )} ?dimension ;`
            : `?dimension . ?dimension`
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
      `.prologue`${pragmas}`;

        let fetchedGeoCoordinates: any[] = [];

        try {
          fetchedGeoCoordinates = await query.execute(sparqlClient.query, {
            operation: "postUrlencoded",
          });
        } catch (e) {
          console.error(e);
        }

        return fetchedGeoCoordinates.map((d) => ({
          iri: d.dimension.value,
          label: d.label.value,
          latitude: +d.latitude.value,
          longitude: +d.longitude.value,
        }));
      })
    );
  };
