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
  async (dimensionIris?: readonly string[]): Promise<RawGeoShape[]> => {
    if (dimensionIris) {
      const query = SELECT`?iri ?label ?WKT`.WHERE`
        VALUES ?iri {
          ${dimensionIris.map((d) => `<${d}>`)}
        }

        ?iri ${ns.geo.hasGeometry} ?geometry .

        OPTIONAL {
          ?iri ${ns.schema.name} ?label .
          FILTER(LANG(?label) = '${locale}')
        }

        OPTIONAL {
          ?iri ${ns.schema.name} ?label .
        }

        SERVICE <${SPARQL_GEO_ENDPOINT}> {
          ?geometry ${ns.geo.asWKT} ?WKT
        }
      `;

      let result: any[] = [];

      try {
        result = await query.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      const parsedResult = result.map((d) => ({
        iri: d.iri.value,
        label: d.label.value,
        wktString: d.WKT?.value,
      }));

      return dimensionIris.map((iri) => ({
        iri,
        label: parsedResult.find((d) => d.iri === iri)?.label,
        wktString: parsedResult.find((d) => d.iri === iri)?.wktString,
      }));
    } else {
      return [];
    }
  };
