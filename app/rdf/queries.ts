import { sparql } from "@tpluscode/rdf-string";
import { descending } from "d3";
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
import {
  DimensionValue,
  Observation,
  parseObservationValue,
} from "../domain/data";
import { SPARQL_ENDPOINT } from "../domain/env";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";
import * as ns from "./namespace";
import { getQueryLocales, parseCube, parseCubeDimension } from "./parse";
import { loadResourceLabels } from "./query-labels";

const NULL_DIMENSION_VALUE = "NULL";

/** Adds a suffix to an iri to mark its label */
const labelDimensionIri = (iri: string) => `${iri}/__label__`;

const createSource = () =>
  new Source({
    sourceGraph: "https://lindas.admin.ch/foen/cube",
    endpointUrl: SPARQL_ENDPOINT,
    queryOperation: "postUrlencoded",
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

  // FIXME: the 2nd condition should not be necessary but due to a but in the query lib, a inexistent cube is not actually null. See https://github.com/zazuko/rdf-cube-view-query/issues/41
  if (!cube || (cube?.out()?.terms?.length ?? 0) === 0) {
    return null;
  }
  // -> This should work instead:
  // if (!cube) {
  //   return null;
  // }

  // FIXME: Remove this workaround until https://github.com/zazuko/rdf-cube-view-query/pull/47 is merged and released
  if (cube) {
    cube.source.queryOperation = "postUrlencoded";
  }

  const versionHistory = cube.in(ns.schema.hasPart)?.term;
  const isPublished =
    cube.out(ns.schema.creativeWorkStatus)?.value ===
    ns.adminTerm("CreativeWorkStatus/Published").value;
  const version = cube.out(ns.schema.version);

  // console.log(`Cube <${iri}> version: ${version?.value}`);

  /**
   * Find newer cubes that satisfy these conditions:
   * - Must have a higher version number
   * - Are from the same version history
   * - If original cube is published, cubes must also be published
   */
  const filters = [
    Cube.filter.isPartOf(versionHistory),
    // Custom filter for version
    ({ cube, index }: $FixMe) => {
      const variable = rdf.variable(`version${index}`);
      return [
        [cube, ns.schema.version, variable],
        sparql`FILTER(${variable} > ${version})`,
      ];
    },
  ];

  const newerCubes = await source.cubes({
    filters: isPublished
      ? [
          ...filters,
          Cube.filter.status(ns.adminTerm("CreativeWorkStatus/Published")),
        ]
      : filters,
  });

  // console.log(
  //   "Newer cubes",
  //   newerCubes.map((c) => c.term?.value)
  // );

  /**
   * Now we find the latest cube:
   * - Try to find the latest PUBLISHED cube
   * - Otherwise pick latest cube
   */

  if (newerCubes.length > 0) {
    newerCubes.sort((a, b) =>
      descending(
        a.out(ns.schema.version)?.value,
        b.out(ns.schema.version)?.value
      )
    );

    const latestCube =
      newerCubes.find(
        (cube) =>
          cube.out(ns.schema.creativeWorkStatus)?.value ===
          ns.adminTerm("CreativeWorkStatus/Published").value
      ) ?? newerCubes[0];

    // console.log("Picked latest cube", latestCube.term?.value);

    return parseCube({ cube: latestCube, locale });
  }

  return parseCube({ cube, locale });
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
}): Promise<DimensionValue[]> => {
  if (
    dimension.minInclusive !== undefined &&
    dimension.maxInclusive !== undefined
  ) {
    const min = parseObservationValue({ value: dimension.minInclusive }) ?? 0;
    const max = parseObservationValue({ value: dimension.maxInclusive }) ?? 0;

    return [
      { value: min, label: `${min}` },
      { value: max, label: `${max}` },
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
}): Promise<DimensionValue[]> => {
  const dimensionValueNamedNodes = (dimension.in?.filter(
    (v) => v.termType === "NamedNode"
  ) ?? []) as NamedNode[];

  const dimensionValueLiterals = (dimension.in?.filter(
    (v) => v.termType === "Literal"
  ) ?? []) as Literal[];

  if (
    dimensionValueNamedNodes.length > 0 &&
    dimensionValueLiterals.length > 0
  ) {
    console.warn(
      `WARNING: dimension with mixed literals and named nodes <${dimension.path?.value}>`
    );

    // console.log(`Named:`);
    // console.log(dimensionValueNamedNodes);
    // console.log(`Literal:`);
    // console.log(dimensionValueLiterals);
  }

  if (
    dimensionValueNamedNodes.length === 0 &&
    dimensionValueLiterals.length === 0
  ) {
    console.warn(
      `WARNING: dimension with NO values <${dimension.path?.value}>`
    );
  }

  const values =
    dimensionValueNamedNodes.length > 0
      ? (
          await loadResourceLabels({ ids: dimensionValueNamedNodes, locale })
        ).map((vl) => {
          return { value: vl.iri.value, label: vl.label?.value ?? "" };
        })
      : dimensionValueLiterals.length > 0
      ? dimensionValueLiterals.map((v) => {
          return ns.cube.Undefined.equals(v.datatype)
            ? {
                value: NULL_DIMENSION_VALUE, // We use a known string here because actual null does not work as value in UI inputs.
                label: "–",
              }
            : {
                value: v.value,
                label: v.value,
              };
        })
      : [];

  return values;
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

  // FIXME: Remove this workaround until https://github.com/zazuko/rdf-cube-view-query/pull/47 is merged and released
  cubeView.dimensions.forEach((d) => {
    d.source.queryOperation = "postUrlencoded";
  });

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
    ? buildFilters({ cube, view: cubeView, filters, locale })
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
  // Override sourceGraph from cube source, so lookups also work outside of that graph
  lookupSource.ptr.deleteOut(ns.cubeView.graph);
  lookupSource.ptr.addOut(ns.cubeView.graph, rdf.defaultGraph());

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

        const value =
          obs[d.data.iri]?.termType === "Literal" &&
          ns.cube.Undefined.equals((obs[d.data.iri] as Literal)?.datatype)
            ? null
            : obs[d.data.iri]?.value;

        return [
          d.data.iri,
          label ?? value ?? null,
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
  locale,
}: {
  cube: Cube;
  view: View;
  filters: Filters;
  locale: string;
}): Filter[] => {
  const filterEntries = Object.entries(filters).flatMap(([dimIri, filter]) => {
    const cubeDimension = cube.dimensions.find((d) => d.path?.value === dimIri);
    if (!cubeDimension) {
      console.warn(`WARNING: No cube dimension ${dimIri}`);
      return [];
    }
    const dimension = view.dimension({ cubeDimension: dimIri });

    if (!dimension) {
      return [];
    }

    const parsedCubeDimension = parseCubeDimension({
      dim: cubeDimension,
      cube,
      locale,
    });

    const { dataType } = parsedCubeDimension.data;

    if (ns.rdf.langString.value === dataType) {
      console.warn(
        `WARNING: Dimension <${dimIri}> has dataType 'langString'. Filtering won't work.`
      );
    }

    const toRDFValue = (value: string): NamedNode | Literal => {
      return dataType
        ? parsedCubeDimension.data.hasUndefinedValues &&
          value === NULL_DIMENSION_VALUE
          ? rdf.literal("", ns.cube.Undefined)
          : rdf.literal(value, dataType)
        : rdf.namedNode(value);
    };

    const selectedValues =
      filter.type === "single"
        ? [dimension.filter.eq(toRDFValue(filter.value))]
        : filter.type === "multi"
        ? // If values is an empty object, we filter by something that doesn't exist
          [
            dimension.filter.in(
              Object.keys(filter.values).length > 0
                ? Object.entries(filter.values).flatMap(([value, selected]) =>
                    selected ? [toRDFValue(value)] : []
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
