import { SELECT } from "@tpluscode/sparql-builder";
import { groupBy } from "lodash";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { SPARQL_GEO_ENDPOINT } from "../domain/env";

import * as ns from "./namespace";

export interface RawGeoShape {
  iri: string;
  label: string;
  wktString?: string;
}

/**
 * Creates a GeoShapes loader.
 *
 * @param dimensionIris IRIs of a GeoShape dimension's values
 */
export const createGeoShapesLoader =
  ({ locale, sparqlClient }: { locale: string; sparqlClient: ParsingClient }) =>
  async (dimensionIris?: readonly string[]): Promise<RawGeoShape[]> => {
    if (dimensionIris) {
      const preparedDimensionIris = dimensionIris.map((d) => `<${d}>`);

      const labelsQuery = SELECT`?iri ?label`.WHERE`
      VALUES ?iri {
        ${preparedDimensionIris}
      }

      OPTIONAL {
        ?iri ${ns.schema.name} ?label .
        FILTER(LANG(?label) = '${locale}')
      }

      OPTIONAL {
        ?iri ${ns.schema.name} ?label .
      }
    `;

      let labels: any[] = [];

      try {
        labels = await labelsQuery.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      const groupedLabels = groupBy(
        labels.map((d) => ({
          iri: d.iri.value,
          label: d.label.value,
        })),
        (d) => d.iri
      );

      const wktQuery = SELECT`?iri ?WKT`.WHERE`
        VALUES ?iri {
          ${preparedDimensionIris}
        }

        ?iri ${ns.geo.hasGeometry} ?geometry .

        SERVICE <${SPARQL_GEO_ENDPOINT}> {
          ?geometry ${ns.geo.asWKT} ?WKT
        }
      `;

      let wktStrings: any[] = [];

      try {
        wktStrings = await wktQuery.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      const groupedWktStrings = groupBy(
        wktStrings.map((d) => ({
          iri: d.iri.value,
          wktString: d.WKT.value,
        })),
        (d) => d.iri
      );

      const result = dimensionIris.map((iri) => ({
        iri,
        label: groupedLabels[iri][0].label || iri,
        // there might be iris without shapes
        wktString: groupedWktStrings[iri]?.[0].wktString,
      }));

      return result;
    } else {
      return [];
    }
  };
