import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { Filters } from "@/configurator";
import {
  DataCubeDimension,
  DataCubeMeasure,
  DimensionValue,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { Loaders } from "@/graphql/context";
import {
  DataCubeResolvers,
  DimensionResolvers,
  QueryResolvers,
  Resolvers,
  SearchCubeResultOrder,
} from "@/graphql/resolver-types";
import { resolveDimensionType, resolveMeasureType } from "@/graphql/resolvers";
import { defaultLocale } from "@/locales/locales";
import { parseCube, parseIri } from "@/rdf/parse";
import {
  createCubeDimensionValuesLoader,
  getCubeDimensions,
  getCubeObservations,
  getCubesDimensions,
  getLatestCube,
} from "@/rdf/queries";
import { unversionObservation } from "@/rdf/query-dimension-values";
import { queryHierarchy } from "@/rdf/query-hierarchies";
import { SearchResult, searchCubes as _searchCubes } from "@/rdf/query-search";

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

export const dataCubeByIri: NonNullable<QueryResolvers["dataCubeByIri"]> =
  async (_, { iri, locale, latest = true }, { setup }, info) => {
    const { loaders } = await setup(info);
    const rawCube = await loaders.cube.load(iri);

    if (!rawCube) {
      throw new Error("Cube not found");
    }

    const cube = latest ? await getLatestCube(rawCube) : rawCube;
    await cube.fetchShape();

    return parseCube({ cube, locale: locale ?? defaultLocale });
  };

export const possibleFilters: NonNullable<QueryResolvers["possibleFilters"]> =
  async (_, { iri, filters }, { setup }, info) => {
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

export const dataCubesComponents: NonNullable<
  QueryResolvers["dataCubesComponents"]
> = async (_, { locale, filters }, { setup }, info) => {
  const { loaders, sparqlClient, cache } = await setup(info);

  const cubes = (
    await Promise.all(
      filters.map(async (filter) => {
        const { iri, latest = true } = filter;
        const cube = await loaders.cube.load(iri);

        if (!cube) {
          throw new Error(`Cube ${iri} not found!`);
        }

        if (latest) {
          return await getLatestCube(cube);
        }

        return cube;
      })
    )
  ).filter(truthy);

  const rawComponents = await getCubesDimensions(cubes, {
    locale,
    sparqlClient,
    filters,
    cache,
  });

  const dimensions: DataCubeDimension[] = [];
  const measures: DataCubeMeasure[] = [];
  await Promise.all(
    rawComponents.map(async (component) => {
      const { cube, data } = component;
      const baseComponent = {
        cubeIri: parseIri(cube),
        iri: data.iri,
        label: data.name,
        description: data.description,
        unit: data.unit,
        scaleType: data.scaleType,
        dataType: data.dataType,
        order: data.order,
        isNumerical: data.isNumerical,
        isKeyDimension: data.isKeyDimension,
        values: await loaders.dimensionValues.load(component),
        related: data.related,
      };

      if (data.isMeasureDimension) {
        const result = {
          __typename: resolveMeasureType(component),
          isCurrency: data.isCurrency,
          isDecimal: data.isDecimal,
          currencyExponent: data.currencyExponent,
          resolution: data.resolution,
          ...baseComponent,
        } as DataCubeMeasure;

        measures.push(result);
      } else {
        const result = {
          __typename: resolveDimensionType(component),
          ...baseComponent,
        } as DataCubeDimension;

        dimensions.push(result);
      }
    })
  );

  return { dimensions, measures };
};

export const dataCubeDimensions: NonNullable<DataCubeResolvers["dimensions"]> =
  async ({ cube, locale }, { componentIris }, { setup }, info) => {
    const { sparqlClient, cache } = await setup(info);
    const dimensions = await getCubeDimensions({
      cube,
      locale,
      sparqlClient,
      componentIris,
      cache,
    });

    return dimensions.filter((d) => !d.data.isMeasureDimension);
  };

export const dataCubeMeasures: NonNullable<DataCubeResolvers["measures"]> =
  async ({ cube, locale }, { componentIris }, { setup }, info) => {
    const { sparqlClient, cache } = await setup(info);
    const dimensions = await getCubeDimensions({
      cube,
      locale,
      sparqlClient,
      componentIris,
      cache,
    });

    return dimensions.filter((d) => d.data.isMeasureDimension);
  };

export const dataCubeDimensionByIri: NonNullable<
  DataCubeResolvers["dimensionByIri"]
> = async ({ cube, locale }, { iri }, { setup }, info) => {
  const { sparqlClient, cache } = await setup(info);
  const dimensions = await getCubeDimensions({
    cube,
    locale,
    sparqlClient,
    componentIris: [iri],
    cache,
  });
  const dimension = dimensions.find((d) => iri === d.data.iri);
  if (!dimension) {
    console.warn(
      `Available dimensions: \n  ${dimensions
        .map((d) => `${d.data.name}: ${d.dimension.path}`)
        .join("\n  ")}`
    );
    throw new Error(`Cannot find dimension ${iri}`);
  }
  return dimension ?? null;
};

export const dataCubeObservations: NonNullable<
  DataCubeResolvers["observations"]
> = async (
  { cube, locale },
  { limit, filters, componentIris },
  { setup },
  info
) => {
  const { sparqlClient, cache } = await setup(info);
  const { query, observations, observationsRaw } = await getCubeObservations({
    cube,
    locale,
    sparqlClient,
    filters: filters ?? undefined,
    limit: limit ?? undefined,
    componentIris,
    cache,
  });

  return {
    cube,
    locale,
    data: {
      query,
      observations,
      observationsRaw,
      selectedFields: [],
    },
  };
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
  rdimension,
  _args,
  { setup },
  info
) => {
  const { locale } = info.variableValues;
  const { sparqlClient, sparqlClientStream, cache } = await setup(info);

  if (!rdimension.cube) {
    throw new Error("Could not find cube");
  }

  return await queryHierarchy(
    rdimension,
    locale,
    sparqlClient,
    sparqlClientStream,
    cache
  );
};

export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async (parent, { filters, disableLoad }, { setup }, info) => {
  if (disableLoad) {
    return [];
  }

  const { loaders, sparqlClient, cache } = await setup(info);
  // Different loader if we have filters or not
  const loader = getDimensionValuesLoader(
    sparqlClient,
    loaders,
    cache,
    filters
  );
  const values: DimensionValue[] = await loader.load(parent);

  return values.sort((a, b) =>
    ascending(
      a.position ?? a.value ?? undefined,
      b.position ?? b.value ?? undefined
    )
  );
};
