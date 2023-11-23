import max from "lodash/max";
import min from "lodash/min";

import { QueryFilters } from "@/config-types";
import { DimensionValue, Observation } from "@/domain/data";
import { SQL_ENDPOINT } from "@/domain/env";
import {
  DataCubePublicationStatus,
  DataCubeResolvers,
  DimensionResolvers,
  QueryResolvers,
  Resolvers,
  TimeUnit,
} from "@/graphql/resolver-types";
import { ResolvedDataCube, ResolvedDimension } from "@/graphql/shared-types";

const fetchSQL = ({
  path,
  pathParams,
  method = "GET",
  body,
}: {
  path: string;
  pathParams?: string | URLSearchParams | string[][] | Record<string, string>;
  method?: "GET" | "POST";
  body?: BodyInit;
}) =>
  fetch(
    `${SQL_ENDPOINT}${path}${
      pathParams ? `?${new URLSearchParams(pathParams)}` : ``
    }`,
    { method, body }
  );

type SQLCube = {
  iri: string;
  title: string;
  description: string;
  dimensions: SQLDimension[];
};

type SQLDimension = {
  iri: string;
  name: string;
  type: SQLDimensionType;
  unit?: string;
  values: string[] | { min: string; max: string };
};

type SQLDimensionType =
  | "GeoCoordinates"
  | "GeoShapes"
  | "Nominal"
  | "Ordinal"
  | "Temporal"
  | "Measure";

const parseSQLCube = (cube: SQLCube): ResolvedDataCube => {
  const { iri, title, description } = cube;

  return {
    cube: cube as any,
    locale: "en",
    data: {
      iri,
      title,
      description,
      publicationStatus: DataCubePublicationStatus.Published,
      identifier: "",
    },
  };
};

const parseSQLDimension = (
  cube: ResolvedDataCube,
  dimension: SQLDimension
): ResolvedDimension => {
  const { iri, name, type, unit } = dimension;
  const isMeasure = type === "Measure";
  const isTemporal = type === "Temporal";

  return {
    // FIXME: type of cube should be different for RDF and SQL.
    cube: cube as any,
    // FIXME: type of dimension should be different for RDF and SQL.
    dimension: dimension as any,
    // FIXME: handle locale properly
    locale: "en",
    data: {
      iri,
      name,
      isLiteral: true,

      // FIXME: Handle currencies in SQL resolvers
      isCurrency: false,
      // FIXME: Handle isDecimal in SQL resolvers
      isDecimal: false,
      currencyExponent: 0,
      // FIXME: not only measures can be numerical
      isNumerical: isMeasure,
      isKeyDimension: true,
      isMeasureDimension: isMeasure,
      hasUndefinedValues: false,
      unit,
      dataType: undefined,
      dataKind: isTemporal ? "Time" : undefined,
      related: [],
      // FIXME: add appropriate fields in the database
      timeUnit: isTemporal ? TimeUnit.Year : undefined,
      timeFormat: isTemporal ? "%Y" : undefined,
      scaleType: undefined,
    },
  };
};

export const searchCubes: NonNullable<QueryResolvers["searchCubes"]> =
  async () => {
    const result = await fetchSQL({ path: "cubes" });
    const cubes = await result.json();

    return cubes.map((d: SQLCube) => ({
      dataCube: parseSQLCube(d),
    }));
  };

export const dataCubeComponents: NonNullable<
  QueryResolvers["dataCubeComponents"]
> = async () => {
  return { dimensions: [], measures: [] };
};

export const dataCubeMetadata: NonNullable<QueryResolvers["dataCubeMetadata"]> =
  async () => {
    return {} as any;
  };

export const dataCubeByIri: NonNullable<QueryResolvers["dataCubeByIri"]> =
  async (_, { iri }) => {
    const result = await fetchSQL({ path: `cubes/${iri}` });
    const cube = await result.json();

    return parseSQLCube(cube);
  };

export const possibleFilters: NonNullable<QueryResolvers["possibleFilters"]> =
  async (_, { iri, filters }) => {
    // FIXME: there ideally would be an access to a parent cube
    const result = await fetchSQL({
      path: "cube_observations",
      pathParams: { cube_iri: iri },
    });
    const allObservations: Observation[] = await result.json();
    const nbFilters = Object.keys(filters).length;

    for (let i = nbFilters; i > 0; i--) {
      const queryFilters = Object.fromEntries(
        Object.entries(filters).slice(0, i)
      );
      const observations = filterObservations(allObservations, queryFilters);

      if (observations.length === 0) {
        continue;
      }

      const result = Object.keys(filters).map((d) => ({
        iri: d,
        type: "single",
        value: observations[0][d],
      }));

      return result;
    }

    return [];
  };

export const dataCubeDimensions: NonNullable<DataCubeResolvers["dimensions"]> =
  async ({ cube }) => {
    // FIXME: type of cube should be different for RDF and SQL.
    const dimensions = cube.dimensions as unknown as SQLDimension[];
    return (
      dimensions
        .filter((d) => d.type !== "Measure")
        // FIXME: type of cube should be different for RDF and SQL.
        .map((d) => parseSQLDimension(cube as unknown as ResolvedDataCube, d))
    );
  };

export const dataCubeDimensionByIri: NonNullable<
  DataCubeResolvers["dimensionByIri"]
> = async ({ cube }, { iri }) => {
  // FIXME: type of cube should be different for RDF and SQL.
  const dimensions = cube.dimensions as unknown as SQLDimension[];
  const dimension = dimensions.find((d) => d.iri === iri);

  if (dimension) {
    return parseSQLDimension(cube as unknown as ResolvedDataCube, dimension);
  }

  return null;
};

export const hierarchy: NonNullable<DimensionResolvers["hierarchy"]> =
  async () => {
    return [];
  };

// FIXME: should be a call to API (to be able to implement proper filtering)
export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async ({ cube, data: { iri, dataKind, isNumerical } }, { filters }) => {
  const reversedFiltersEntries = Object.entries(filters || {}).reverse();
  const keys = reversedFiltersEntries.map((d) => d[0]);
  const index = keys.indexOf(iri);
  // Filter by filters below a given filter (left panel).
  const slicedFilters = Object.fromEntries(
    reversedFiltersEntries.slice(index + 1, reversedFiltersEntries.length)
  );

  // FIXME: type of cube should be different for RDF and SQL.
  const observations = filterObservations(
    (cube as any).observations,
    slicedFilters as QueryFilters | undefined
  );
  const values = Array.from(new Set(observations.map((d) => d[iri])));

  if (dataKind === "Time" || isNumerical) {
    return [
      { label: min(values), value: min(values) },
      { label: max(values), value: max(values) },
    ] as DimensionValue[];
  } else {
    return values.map((d) => ({ label: d, value: d })) as DimensionValue[];
  }
};

export const dataCubeMeasures: NonNullable<DataCubeResolvers["measures"]> =
  async ({ cube }) => {
    // FIXME: type of cube should be different for RDF and SQL.
    const dimensions = cube.dimensions as unknown as SQLDimension[];
    return (
      dimensions
        .filter((d) => d.type === "Measure")
        // FIXME: type of cube should be different for RDF and SQL.
        .map((d) => parseSQLDimension(cube as unknown as ResolvedDataCube, d))
    );
  };

const filterObservations = (
  allObservations: Observation[],
  filters: QueryFilters | undefined
) => {
  const observations: Observation[] = [];

  // FIXME: move to backend
  if (filters) {
    const filtersEntries = Object.entries(filters);
    allObservations.forEach((d) => {
      const add = filtersEntries.reduce((acc, _, index) => {
        const filter = filtersEntries[index];
        // TODO: implement multi & range filters.
        if (filter[1].type === "single") {
          const [k, { value }] = filter;
          if (d[k] === value) {
            acc.push(true);
          }

          acc.push(false);
        } else if (filter[1].type === "range") {
          const [k, { from, to }] = filter;
          const v = d[k];

          if (v !== null) {
            // FIXME: handle properly, right now works only for years.
            if (+v >= +from && +v <= +to) {
              acc.push(true);
            }
          }

          acc.push(false);
        }

        return acc;
      }, [] as boolean[]);
      if (add.filter(Boolean).length === filtersEntries.length) {
        observations.push(d);
      }
    });
  } else {
    allObservations.forEach((d) => observations.push(d));
  }

  return observations;
};

// FIXME: should be a call to API (to be able to implement proper filtering)
export const observations: NonNullable<DataCubeResolvers["observations"]> =
  async ({ cube, locale }, { filters, limit }) => {
    const rawObservations = (cube as any).observations as Observation[];
    const allObservations = limit
      ? rawObservations.slice(0, limit)
      : rawObservations;
    const observations = filterObservations(
      allObservations,
      filters as QueryFilters | undefined
    );

    return {
      cube,
      locale,
      data: {
        query: "",
        observations,
        selectedFields: [],
      },
    };
  };

export const dataCubeObservations: NonNullable<
  QueryResolvers["dataCubeObservations"]
> = async () => {
  return {
    data: [],
    sparqlEditorUrl: "",
  };
};
