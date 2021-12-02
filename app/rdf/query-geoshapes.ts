import { SELECT } from "@tpluscode/sparql-builder";
import { groups } from "d3";
import { SPARQL_GEO_ENDPOINT } from "../domain/env";
import * as ns from "./namespace";
import { sparqlClient } from "./sparql-client";

const BATCH_SIZE = 500;
export interface RawGeoShape {
  iri: string;
  label: string;
  wktString: string;
}

/**
 * Creates a WKT geo shapes loader.
 *
 * @param dimensionValues IRIs of geo dimension values
 */
export const createGeoShapesLoader =
  ({ locale }: { locale: string }) =>
  async (dimensionValues?: readonly string[]): Promise<RawGeoShape[][]> => {
    if (dimensionValues) {
      // We query in batches because we might run into "413 – Error: Payload Too Large"
      const batched = groups(dimensionValues.flat(), (_, i) =>
        Math.floor(i / BATCH_SIZE)
      );

      const results = await Promise.all(
        batched.map(async ([, values]) => {
          const query = SELECT`?geoShapeIri ?label ?WKT`.WHERE`
          values ?geoShapeIri {
              ${values}
          }
  
          ?geoShapeIri
            ${ns.geo.hasGeometry} ?geometry ;
            ${ns.schema.name} ?label .
  
          SERVICE <${SPARQL_GEO_ENDPOINT}> {
            ?geometry ${ns.geo.asWKT} ?WKT
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
            iri: d.geoShapeIri.value,
            label: d.label?.value,
            wktString: d.WKT.value,
          }));
        })
      );

      return results;
    } else {
      return [];
    }
  };

export const loadGeoShapes = ({ locale }: { locale: string }) => {
  return createGeoShapesLoader({ locale })();
};
