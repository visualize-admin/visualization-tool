import { SELECT } from "@tpluscode/sparql-builder";
import { groupBy } from "lodash";
import { ParsingClient } from "sparql-http-client/ParsingClient";

import { SPARQL_GEO_ENDPOINT } from "../domain/env";

import * as ns from "./namespace";

export interface RawGeoShape {
  iri: string;
  label: string;
  level: number;
  wktString?: string;
}

interface NarrowerValue {
  iri: string;
  narrower: string | undefined;
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

      const narrowerQuery = SELECT`?iri ?narrower`.WHERE`
        VALUES ?iri {
          ${preparedDimensionIris}
        }

        OPTIONAL {
          ?iri ${ns.skos.narrower} ?narrower .
          FILTER(?narrower IN (${preparedDimensionIris.join(",")}))
        }
    `;

      let narrowerValues: any[] = [];

      try {
        narrowerValues = await narrowerQuery.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      const parsedNarrowerValues: NarrowerValue[] = narrowerValues.map((d) => ({
        iri: d.iri.value,
        narrower: d.narrower?.value,
      }));

      const groupedHierarchy = groupBy(
        createHierarchy({
          dimensionIris,
          narrowerValues: parsedNarrowerValues,
        }),
        (d) => d.iri
      );

      const result = dimensionIris.map((iri) => ({
        iri,
        label: groupedLabels[iri][0].label || iri,
        level: groupedHierarchy[iri][0].level,
        // there might be iris without shapes
        wktString: groupedWktStrings[iri]?.[0].wktString,
      }));

      return result;
    } else {
      return [];
    }
  };

interface RawHierarchyLevel {
  iri: string;
  level: number;
}

export interface HierarchyLevel extends RawHierarchyLevel {
  label: string;
}

/**
 * Creates a hierarchy based on a geo dimension starting from lowest level
 * (iris that do not contain skos:narrower) and ending when all the iris
 * are added to the hierarchy.
 *
 * @param dimensionIris IRIs of a GeoShape dimension's values
 * @param narrowerValues objects containing information on the hierarchy
 */
const createHierarchy = ({
  dimensionIris,
  narrowerValues,
}: {
  dimensionIris: readonly string[];
  narrowerValues: NarrowerValue[];
}) => {
  const go = ({
    tree,
    level = 1,
    iris,
  }: {
    tree: RawHierarchyLevel[];
    level?: number;
    iris: string[];
  }): RawHierarchyLevel[] => {
    if (!tree.length) {
      tree.push(...iris.map((d) => ({ iri: d, level })));
    }

    if (tree.length === dimensionIris.length) {
      return tree;
    }

    const parentValues = [] as RawHierarchyLevel[];
    let parentIris = [] as string[];

    const groupedNarrower = groupBy(narrowerValues, (d) => d.narrower);

    for (const iri of iris) {
      const parent = groupedNarrower[iri];
      parentIris = parentValues.map((d) => d.iri);

      if (parent && !parentIris.includes(parent[0].iri)) {
        parentValues.push({ iri: parent[0].iri, level: level + 1 });
      }
    }

    if (parentValues.length) {
      tree.push(...parentValues);
    }

    return go({ tree, level: level + 1, iris: parentIris });
  };

  const lowestLevelIris = narrowerValues
    .filter((d) => !d.narrower)
    .map((d) => d.iri);

  return go({ tree: [], iris: lowestLevelIris });
};
