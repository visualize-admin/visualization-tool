import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import ParsingClient from "sparql-http-client/ParsingClient";
import { topology } from "topojson-server";
import { LRUCache } from "typescript-lru-cache";

import { Filters } from "@/configurator";
import {
  BaseComponent,
  BaseDimension,
  Dimension,
  DimensionValue,
  GeoProperties,
  GeoShapes,
  Measure,
  TemporalDimension,
} from "@/domain/data";
import { Loaders } from "@/graphql/context";
import {
  DimensionResolvers,
  QueryResolvers,
  Resolvers,
  SearchCubeResultOrder,
} from "@/graphql/resolver-types";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";
import { LightCube } from "@/rdf/light-cube";
import {
  createCubeDimensionValuesLoader,
  getCubeDimensions,
  getCubeObservations,
  getLatestCube,
} from "@/rdf/queries";
import { unversionObservation } from "@/rdf/query-dimension-values";
import { queryHierarchy } from "@/rdf/query-hierarchies";
import { SearchResult, searchCubes as _searchCubes } from "@/rdf/query-search";
import { getSparqlEditorUrl } from "@/rdf/sparql-utils";

const sortResults = (
  results: SearchResult[],
  order: SearchCubeResultOrder | undefined | null,
  locale: string | undefined | null
): SearchResult[] => {
  switch (order) {
    case SearchCubeResultOrder.TitleAsc:
      results.sort((a, b) =>
        a.cube.title.localeCompare(b.cube.title, locale ?? undefined)
      );
      break;
    case SearchCubeResultOrder.CreatedDesc:
    case undefined:
    case null:
      results.sort((a, b) => {
        const ra = a.cube.datePublished ?? "0";
        const rb = b.cube.datePublished ?? "0";

        return descending(ra, rb);
      });
      break;
    case SearchCubeResultOrder.Score:
      break;
    default:
      const _exhaustiveCheck: never = order;
      return _exhaustiveCheck;
  }
  return results;
};

export const searchCubes: NonNullable<QueryResolvers["searchCubes"]> = async (
  _,
  { locale, query, order, includeDrafts, filters },
  { setup },
  info
) => {
  const { sparqlClient } = await setup(info);
  const cubes = await _searchCubes({
    locale,
    includeDrafts,
    filters,
    query,
    sparqlClient,
  });
  sortResults(cubes, order, locale);

  return cubes;
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

export const possibleFilters: NonNullable<
  QueryResolvers["possibleFilters"]
> = async (_, { iri, filters }, { setup }, info) => {
  const { sparqlClient, loaders, cache } = await setup(info);
  const rawCube = await loaders.cube.load(iri);
  // Currently we always default to the latest cube.
  const cube = await getLatestCube(rawCube);
  await cube.fetchShape();

  if (!cube) {
    return [];
  }

  const nbFilters = Object.keys(filters).length;
  for (let i = nbFilters; i > 0; i--) {
    const queryFilters = Object.fromEntries(
      Object.entries(filters).slice(0, i)
    );
    const { observations: obs } = await getCubeObservations({
      cube,
      locale: "en",
      sparqlClient,
      filters: queryFilters,
      limit: 1,
      raw: true,
      cache,
    });

    if (obs.length === 0) {
      continue;
    }

    const unversioned = await unversionObservation({
      observation: obs[0],
      cube,
      sparqlClient,
    });

    return Object.keys(filters).map((f) => ({
      iri: f,
      type: "single",
      value: unversioned[f],
    }));
  }

  return [];
};

export const dataCubeComponents: NonNullable<
  QueryResolvers["dataCubeComponents"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { loaders, sparqlClient, sparqlClientStream, cache } =
    await setup(info);
  const { iri, latest = true, componentIris, filters, loadValues } = cubeFilter;
  const rawCube = await loaders.cube.load(iri);

  if (!rawCube) {
    throw new Error(`Cube ${iri} not found!`);
  }

  const cube = latest ? await getLatestCube(rawCube) : rawCube;
  await cube.fetchShape();

  const rawComponents = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    componentIris,
    cache,
  });

  const dimensions: Dimension[] = [];
  const measures: Measure[] = [];

  await Promise.all(
    rawComponents.map(async (component) => {
      const { data } = component;
      const dimensionValuesLoader = getDimensionValuesLoader(
        sparqlClient,
        loaders,
        cache,
        filters
      );
      const values: DimensionValue[] = loadValues
        ? await dimensionValuesLoader.load(component)
        : [];
      values.sort((a, b) =>
        ascending(
          a.position ?? a.value ?? undefined,
          b.position ?? b.value ?? undefined
        )
      );
      const baseComponent: BaseComponent = {
        // We need to use original iri here, as the cube iri might have changed.
        cubeIri: iri,
        iri: data.iri,
        label: data.name,
        description: data.description,
        unit: data.unit,
        scaleType: data.scaleType,
        dataType: data.dataType,
        order: data.order,
        isNumerical: data.isNumerical,
        isKeyDimension: data.isKeyDimension,
        values,
        related: data.related,
      };

      if (data.isMeasureDimension) {
        const result: Measure = {
          __typename: resolveMeasureType(component.data.scaleType),
          isCurrency: data.isCurrency,
          isDecimal: data.isDecimal,
          currencyExponent: data.currencyExponent,
          resolution: data.resolution,
          ...baseComponent,
        };

        measures.push(result);
      } else {
        const { dataKind, scaleType, related } = component.data;
        const dimensionType = resolveDimensionType(
          dataKind,
          scaleType,
          related
        );
        const hierarchy = loadValues
          ? await queryHierarchy(
              component,
              locale,
              sparqlClient,
              sparqlClientStream,
              cache,
              // Only pass values if there are no filters, as we need to fetch
              // the full, not filtered hierarchy.
              filters ? undefined : values
            )
          : null;
        const baseDimension: BaseDimension = {
          ...baseComponent,
          hierarchy,
        };

        switch (dimensionType) {
          case "TemporalDimension": {
            if (!data.timeFormat || !data.timeUnit) {
              throw new Error(
                `Temporal dimension ${data.iri} is missing timeFormat or timeUnit!`
              );
            }

            const dimension: TemporalDimension = {
              __typename: dimensionType,
              timeFormat: data.timeFormat,
              timeUnit: data.timeUnit,
              ...baseDimension,
            };
            dimensions.push(dimension);
            break;
          }
          default: {
            const dimension: Exclude<Dimension, TemporalDimension> = {
              __typename: dimensionType,
              ...baseDimension,
            };
            dimensions.push(dimension);
          }
        }
      }
    })
  );

  return { dimensions, measures };
};

export const dataCubeMetadata: NonNullable<
  QueryResolvers["dataCubeMetadata"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const { iri, latest = true } = cubeFilter;
  const cube = await new LightCube({ iri, locale, sparqlClient }).init(
    !!latest
  );

  return await cube.fetchMetadata();
};

export const dataCubeObservations: NonNullable<
  QueryResolvers["dataCubeObservations"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { loaders, sparqlClient, cache } = await setup(info);
  const { iri, latest = true, filters, componentIris } = cubeFilter;
  const rawCube = await loaders.cube.load(iri);

  if (!rawCube) {
    throw new Error("Cube not found!");
  }

  const cube = latest ? await getLatestCube(rawCube) : rawCube;
  await cube.fetchShape();

  const { query, observations } = await getCubeObservations({
    cube,
    locale,
    sparqlClient,
    filters,
    componentIris,
    cache,
  });

  return {
    data: observations,
    sparqlEditorUrl: getSparqlEditorUrl({
      query,
      dataSource: {
        type: info.variableValues.sourceType,
        url: info.variableValues.sourceUrl,
      },
    }),
  };
};

export const dataCubePreview: NonNullable<
  QueryResolvers["dataCubePreview"]
> = async (_, { locale, cubeFilter }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const { iri, latest = true } = cubeFilter;
  const cube = await new LightCube({ iri, locale, sparqlClient }).init(
    !!latest
  );

  return await cube.fetchPreview();
};

const getDimensionValuesLoader = (
  sparqlClient: ParsingClient,
  loaders: Loaders,
  cache: LRUCache | undefined,
  filters?: Filters | null
): DataLoader<any, any> => {
  let loader: typeof loaders.dimensionValues | undefined;

  if (filters) {
    const filterKey = JSON.stringify(filters);
    const existingLoader = loaders.filteredDimensionValues.get(filterKey);

    if (existingLoader) {
      return existingLoader;
    }

    loader = new DataLoader(
      createCubeDimensionValuesLoader(sparqlClient, cache, filters)
    );
    loaders.filteredDimensionValues.set(filterKey, loader);

    return loader;
  } else {
    return loaders.dimensionValues;
  }
};

export const hierarchy: NonNullable<DimensionResolvers["hierarchy"]> = async (
  resolvedDimension,
  _args,
  { setup },
  info
) => {
  const { locale } = info.variableValues;
  const { sparqlClient, sparqlClientStream, cache } = await setup(info);

  if (!resolvedDimension.cube) {
    throw new Error("Could not find cube");
  }

  return await queryHierarchy(
    resolvedDimension,
    locale,
    sparqlClient,
    sparqlClientStream,
    cache
  );
};

export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async (resolvedDimension, { filters, disableLoad }, { setup }, info) => {
  if (disableLoad) {
    return [];
  }

  const { loaders, sparqlClient, cache } = await setup(info);
  const loader = getDimensionValuesLoader(
    sparqlClient,
    loaders,
    cache,
    filters
  );
  const values: DimensionValue[] = await loader.load(resolvedDimension);

  return values.sort((a, b) =>
    ascending(
      a.position ?? a.value ?? undefined,
      b.position ?? b.value ?? undefined
    )
  );
};
