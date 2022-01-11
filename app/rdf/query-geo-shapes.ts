import { SELECT } from "@tpluscode/sparql-builder";
import { SPARQL_GEO_ENDPOINT } from "../domain/env";
import * as ns from "./namespace";
import { sparqlClient } from "./sparql-client";

export interface RawGeoShape {
  iri: string;
  label: string;
  wktString?: string;
}

/**
 * Creates a GeoShapes loader.
 *
 * @param dimensionValues IRIs of a GeoShape dimension's values
 */
export const createGeoShapesLoader =
  ({ locale }: { locale: string }) =>
  async (dimensionValues?: readonly string[]): Promise<RawGeoShape[]> => {
    if (dimensionValues) {
      const query = SELECT`?geoShapeIri ?label ?WKT`.WHERE`
        VALUES ?geoShapeIri {
          ${dimensionValues}
        }

        OPTIONAL {
          ?geoShapeIri ${ns.schema.name} ?label
        }

        OPTIONAL {
          ?geoShapeIri ${ns.geo.hasGeometry} ?geometry
        }

        OPTIONAL {
          SERVICE <${SPARQL_GEO_ENDPOINT}> {
            ?geometry ${ns.geo.asWKT} ?WKT
          }
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
        label: d.label.value,
        wktString: d.WKT?.value,
      }));
    } else {
      return [];
    }
  };
