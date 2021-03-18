import {
  Cube,
  CubeDimension,
  Filter,
  LookupSource,
  Source,
  View,
} from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import { Filters } from "../configurator";
import { Observation, parseObservationValue } from "../domain/data";
import { SPARQL_ENDPOINT } from "../domain/env";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";
import * as ns from "./namespace";
import { getQueryLocales, parseCube, parseCubeDimension } from "./parse";
import { loadResourceLabels } from "./query-labels";

/** Adds a suffix to an iri to mark it's label */
const labelDimensionIri = (iri: string) => `${iri}/__label__`;

const createSource = () =>
  new Source({
    sourceGraph: "https://lindas.admin.ch/foen/cube",
    endpointUrl: SPARQL_ENDPOINT,
    // user: '',
    // password: ''
  });

export const getCubes = async ({
  includeDrafts,
  locale,
}: {
  includeDrafts: boolean;
  locale: string;
}): Promise<ResolvedDataCube[]> => {
  const source = createSource();

  const cubes = await source.cubes({
    filters: [
      // Deprecated cubes have a schema.org/validThrough property; Only show cubes that don't have it
      Cube.filter.noValidThrough(),
    ].concat(
      includeDrafts
        ? []
        : Cube.filter.status(ns.adminTerm("CreativeWorkStatus/Published"))
    ),
  });

  // See https://github.com/zazuko/cube-creator/blob/master/apis/core/bootstrap/shapes/dataset.ts for current list of cube metadata
  return cubes.map((cube) => parseCube({ cube, locale }));
};

export const getCube = async ({
  iri,
  locale,
}: {
  iri: string;
  locale: string;
}): Promise<ResolvedDataCube | null> => {
  const source = createSource();

  const cube = await source.cube(iri);

  return cube ? parseCube({ cube, locale }) : null;
};

export const getCubeDimensions = ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}): ResolvedDimension[] => {
  try {
    const dimensions = cube.dimensions
      .filter(
        (dim) =>
          dim.path &&
          ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
            dim.path.value ?? ""
          )
      )
      .map((dim) => {
        return parseCubeDimension({ dim, cube, locale });
      });
    return dimensions;
  } catch (e) {
    console.error(e);

    return [];
  }
};

export const getCubeDimensionValues = async ({
  dimension,
  cube,
  locale,
}: {
  dimension: CubeDimension;
  cube: Cube;
  locale: string;
}): Promise<{ value: string; label: string }[]> => {
  if (
    dimension.minInclusive !== undefined &&
    dimension.maxInclusive !== undefined
  ) {
    const min = parseObservationValue({ value: dimension.minInclusive });
    const max = parseObservationValue({ value: dimension.maxInclusive });
    console.log({ min, max });
    return [
      { value: min.toString(), label: min.toString() },
      { value: max.toString(), label: max.toString() },
    ];
  }

  return await getCubeDimensionValuesWithLabels({
    dimension,
    cube,
    locale,
  });
};

const getCubeDimensionValuesWithLabels = async ({
  dimension,
  cube,
  locale,
}: {
  dimension: CubeDimension;
  cube: Cube;
  locale: string;
}): Promise<{ value: string; label: string }[]> => {
  // try {
  //   const view = View.fromCube(cube);
  //   const viewDimension = view.dimension({ cubeDimension: dimension })!;

  //   const source = createSource();
  //   const lookupSource = LookupSource.fromSource(source);
  //   const lookupView = new View({ parent: source });

  //   const labelDimension = lookupView.createDimension({
  //     source: lookupSource,
  //     path: schema.name,
  //     join: viewDimension,
  //     as: ns.visualizeAdmin("dimensionValueLabel"),
  //   });

  //   lookupView.addDimension(viewDimension).addDimension(labelDimension);

  //   console.log(lookupView.observationsQuery().query.toString());
  // } catch (e) {
  //   console.log("Could not look up labels");
  //   console.error(e);
  // }

  const dimensionValueIris = dimension.in?.filter(
    (v) => v.termType === "NamedNode"
  );

  const dimensionValueLabels =
    dimensionValueIris && dimensionValueIris?.length > 0
      ? await loadResourceLabels({ ids: dimensionValueIris, locale })
      : [];

  return dimensionValueLabels.map((vl) => {
    return {
      value: vl.iri.value,
      label: vl.label.value,
    };
  });
};

export const getCubeObservations = async ({
  cube,
  locale,
  filters,
  limit,
}: {
  cube: Cube;
  locale: string;
  filters?: Filters;
  limit?: number;
}): Promise<{
  query: string;
  observations: Observation[];
  observationsRaw: Record<string, Literal | NamedNode>[];
}> => {
  const cubeView = View.fromCube(cube);

  // Only choose dimensions that we really want
  let observationDimensions = cubeView.dimensions.filter((d) =>
    d.cubeDimensions.every(
      (cd) =>
        cd.path &&
        ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
          cd.path.value ?? ""
        )
    )
  );

  let observationFilters = filters
    ? buildFilters({ cube, view: cubeView, filters })
    : [];

  // let observationFilters = [];

  /**
   * Add labels to named dimensions
   */
  const cubeDimensions = getCubeDimensions({ cube, locale });

  // Find dimensions which are NOT literal
  const namedDimensions = cubeDimensions.filter(
    ({ data: { isLiteral } }) => !isLiteral
  );

  const lookupSource = LookupSource.fromSource(cube.source);

  for (const dimension of namedDimensions) {
    const labelDimension = cubeView.createDimension({
      source: lookupSource,
      path: ns.schema.name,
      join: cubeView.dimension({ cubeDimension: dimension.data.iri }),
      as: labelDimensionIri(dimension.data.iri),
    });

    observationDimensions.push(labelDimension);
    observationFilters.push(
      labelDimension.filter.lang(getQueryLocales(locale))
    );
  }

  const observationsView = new View({
    dimensions: observationDimensions,
    filters: observationFilters,
  });

  /**
   * Add LIMIT to query
   */
  if (limit !== undefined) {
    // From https://github.com/zazuko/cube-creator/blob/a32a90ff93b2c6c1c5ab8fd110a9032a8d179670/apis/core/lib/domain/observations/lib/index.ts#L41
    observationsView.ptr.addOut(
      ns.cubeView.projection,
      (projection: $FixMe) => {
        // const order = projection
        //   .blankNode()
        //   .addOut(ns.cubeView.dimension, view.dimensions[0].ptr)
        //   .addOut(ns.cubeView.direction, ns.cubeView.Ascending);

        // projection.addList(ns.cubeView.orderBy, order)
        projection.addOut(ns.cubeView.limit, limit);
        // projection.addOut(ns.cubeView.offset, offset)
      }
    );
  }

  const observationsRaw = await observationsView.observations();

  const observations = observationsRaw.map((obs) => {
    return Object.fromEntries(
      cubeDimensions.map((d) => {
        const label = obs[labelDimensionIri(d.data.iri)]?.value;
        const value = obs[d.data.iri]?.value;

        return [
          d.data.iri,
          label ?? value,
          // v !== undefined ? parseObservationValue({ value: v }) : null,
        ];
      })
    );
  });

  const result = {
    query: observationsView.observationsQuery().query.toString(),
    observations,
    observationsRaw,
  };

  return result;
};

const buildFilters = ({
  cube,
  view,
  filters,
}: {
  cube: Cube;
  view: View;
  filters: Filters;
}): Filter[] => {
  const filterEntries = Object.entries(filters).flatMap(([dimIri, filter]) => {
    const cubeDimension = cube.dimensions.find((d) => d.path?.value === dimIri);
    if (!cubeDimension) {
      console.log(`No cube dimension ${dimIri}`);
      return [];
    }
    const dimension = view.dimension({ cubeDimension: dimIri });

    if (!dimension) {
      return [];
    }

    const dataType = cubeDimension.datatype;

    const selectedValues =
      filter.type === "single"
        ? [
            dimension.filter.eq(
              dataType
                ? rdf.literal(filter.value, dataType)
                : rdf.namedNode(filter.value)
            ),
          ]
        : filter.type === "multi"
        ? // If values is an empty object, we filter by something that doesn't exist
          [
            dimension.filter.in(
              Object.keys(filter.values).length > 0
                ? Object.entries(filter.values).flatMap(([value, selected]) =>
                    selected
                      ? [
                          dataType
                            ? rdf.literal(value, dataType)
                            : rdf.namedNode(value),
                        ]
                      : []
                  )
                : [rdf.namedNode("EMPTY_VALUE")]
            ),
          ]
        : [];

    // FIXME: why doesn't .equals work for date types but .in does?
    // Temporary solution: filter everything usin .in!
    // return selectedValues.length === 1
    //   ? [dimension.component.in([toTypedValue(selectedValues[0])])]
    //   :
    // return selectedValues.length > 0 ? [dimension.in(selectedValues)] : [];
    return selectedValues;
  });

  return filterEntries;
};
