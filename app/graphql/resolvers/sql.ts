import { topology } from "topojson-server";

import { Filters } from "@/configurator";
import { GeoProperties, GeoShapes, Observation } from "@/domain/data";
import { SQL_ENDPOINT } from "@/domain/env";
import { ComponentId } from "@/graphql/make-component-id";
import {
  DataCubePublicationStatus,
  QueryResolvers,
} from "@/graphql/resolver-types";
import { ResolvedDataCube } from "@/graphql/shared-types";

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

export const dataCubeLatestIri: NonNullable<
  QueryResolvers["dataCubeLatestIri"]
> = async () => {
  return "";
};

export const dataCubeUnversionedIri: NonNullable<
  QueryResolvers["dataCubeUnversionedIri"]
> = async () => {
  return "";
};

export const searchCubes: NonNullable<
  QueryResolvers["searchCubes"]
> = async () => {
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

export const dataCubeMetadata: NonNullable<
  QueryResolvers["dataCubeMetadata"]
> = async () => {
  return {} as any;
};

export const dataCubeComponentTermsets: NonNullable<
  QueryResolvers["dataCubeComponentTermsets"]
> = async () => {
  return [];
};

export const possibleFilters: NonNullable<
  QueryResolvers["possibleFilters"]
> = async (_, { cubeFilter }) => {
  const { iri, filters } = cubeFilter;
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
      id: d,
      type: "single",
      value: observations[0][d as ComponentId],
    }));

    return result;
  }

  return [];
};

export const dataCubeDimensionGeoShapes: NonNullable<
  QueryResolvers["dataCubeDimensionGeoShapes"]
> = async () => {
  return {
    topology: topology({
      shapes: {
        type: "FeatureCollection",
        features: [],
      } as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoProperties>,
    }) as GeoShapes["topology"],
  };
};

export const dataCubeDimensionGeoCoordinates: NonNullable<
  QueryResolvers["dataCubeDimensionGeoCoordinates"]
> = async () => {
  return [];
};

const filterObservations = (
  allObservations: Observation[],
  filters: Filters | undefined
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
          const [_k, { value }] = filter;
          const k = _k as ComponentId;

          if (d[k] === value) {
            acc.push(true);
          }

          acc.push(false);
        } else if (filter[1].type === "range") {
          const [_k, { from, to }] = filter;
          const k = _k as ComponentId;
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

export const dataCubeObservations: NonNullable<
  QueryResolvers["dataCubeObservations"]
> = async () => {
  return {
    data: [],
    sparqlEditorUrl: "",
  };
};

export const dataCubeObservationsPaginated: NonNullable<
  QueryResolvers["dataCubeObservationsPaginated"]
> = async () => {
  return {
    data: {
      data: [],
      sparqlEditorUrl: "",
    },
    pagination: {
      hasNextPage: false,
      hasPreviousPage: false,
      totalCount: 0,
      limit: 0,
      offset: 0,
    },
    sparqlEditorUrl: "",
  };
};

export const dataCubePreview: NonNullable<
  QueryResolvers["dataCubePreview"]
> = async () => {
  return {
    dimensions: [],
    measures: [],
    observations: [],
  };
};
