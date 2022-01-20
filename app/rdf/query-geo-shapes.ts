import { SELECT } from "@tpluscode/sparql-builder";
import { SPARQL_GEO_ENDPOINT } from "../domain/env";
import * as ns from "./namespace";
import { sparqlClient } from "./sparql-client";

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
  ({ locale }: { locale: string }) =>
  async (dimensionIris?: readonly string[]): Promise<RawGeoShape[]> => {
    if (dimensionIris) {
      const shapesQuery = SELECT`?iri ?label ?WKT`.WHERE`
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

      let shapes: any[] = [];

      try {
        shapes = await shapesQuery.execute(sparqlClient.query, {
          operation: "postUrlencoded",
        });
      } catch (e) {
        console.error(e);
      }

      const parsedShapes = shapes.map((d) => ({
        iri: d.iri.value,
        label: d.label.value,
        wktString: d.WKT.value,
      }));

      const narrowerQuery = SELECT`?iri ?narrower`.WHERE`
        VALUES ?iri {
          ${dimensionIris.map((d) => `<${d}>`)}
        }

        OPTIONAL {
          ?iri ${ns.skos.narrower} ?narrower .
          FILTER(?narrower IN (${dimensionIris.map((d) => `<${d}>`).join(",")}))
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

      const hierarchy = createHierarchy({
        dimensionIris,
        narrowerValues: parsedNarrowerValues,
      });

      return dimensionIris.map((iri) => {
        const shape = parsedShapes.find((d) => d.iri === iri);

        return {
          iri,
          label: shape?.label || iri,
          level: hierarchy.find((d) => d.iri === iri)?.level!,
          wktString: shape?.wktString,
        };
      });
    } else {
      return [];
    }
  };

export interface HierarchyLevel {
  iri: string;
  level: number;
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
    tree: HierarchyLevel[];
    level?: number;
    iris: string[];
  }): HierarchyLevel[] => {
    if (!tree.length) {
      tree.push(...iris.map((d) => ({ iri: d, level })));
    }

    if (tree.length === dimensionIris.length) {
      return tree;
    }

    const parentValues = [] as HierarchyLevel[];
    let parentIris = [] as string[];

    for (const iri of iris) {
      const parent = narrowerValues.find((d) => d.narrower === iri);
      parentIris = parentValues.map((d) => d.iri);

      if (parent && !parentIris.includes(parent.iri)) {
        parentValues.push({ iri: parent.iri, level: level + 1 });
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
