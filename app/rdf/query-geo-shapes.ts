import { SELECT } from "@tpluscode/sparql-builder";
import { Literal, NamedNode } from "rdf-js";
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
  async (
    dimensionValues?: readonly (Literal | NamedNode)[]
  ): Promise<RawGeoShape[]> => {
    if (dimensionValues) {
      const query = SELECT`?iri ?label ?WKT`.WHERE`
        VALUES ?iri {
          ${dimensionValues}
        }

        ?iri
          ${ns.schema.name} ?label ;
          ${ns.geo.hasGeometry} ?geometry .

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

      const parsedResult = result.map((d) => ({
        iri: d.iri.value,
        label: d.label.value,
        wktString: d.WKT?.value,
      }));

      return dimensionValues.map((d) => ({
        iri: d.value,
        label: parsedResult.find((p) => p.iri === d.value)?.label,
        wktString: parsedResult.find((p) => p.iri === d.value)?.wktString,
      }));
    } else {
      return [];
    }
  };
