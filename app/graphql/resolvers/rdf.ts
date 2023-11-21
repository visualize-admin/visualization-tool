import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { Filters } from "@/configurator";
import {
  DataCubesObservations,
  Dimension,
  DimensionValue,
  Measure,
  Observation,
  ObservationValue,
  TemporalDimension,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import { Loaders } from "@/graphql/context";
import {
  DataCubeComponentFilter,
  DataCubeObservationFilter,
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
import { getCubeMetadata } from "@/rdf/query-cube-metadata";
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
  const { loaders, sparqlClient, sparqlClientStream, cache } = await setup(
    info
  );
  // If the cube was updated, we need to also update the filter with the correct iri.
  const filtersWithCorrectIri: DataCubeComponentFilter[] = [];

  const cubes = (
    await Promise.all(
      filters.map(async (filter) => {
        const { iri, latest = true } = filter;
        const cube = await loaders.cube.load(iri);

        if (!cube) {
          throw new Error(`Cube ${iri} not found!`);
        }

        if (latest) {
          const latestCube = await getLatestCube(cube);
          await latestCube.fetchShape();

          filtersWithCorrectIri.push({
            ...filter,
            iri: latestCube.term?.value!,
          });

          return latestCube;
        }

        await cube.fetchShape();
        filtersWithCorrectIri.push(filter);

        return cube;
      })
    )
  ).filter(truthy);

  const rawComponents = await getCubesDimensions(cubes, {
    locale,
    sparqlClient,
    filters: filtersWithCorrectIri,
    cache,
  });

  const dimensions: Dimension[] = [];
  const measures: Measure[] = [];

  await Promise.all(
    rawComponents.map(async (component) => {
      const { cube, data } = component;
      const cubeFilters = filtersWithCorrectIri.find(
        (d) => d.iri === component.cube.term?.value
      );
      const dimensionValuesLoader = getDimensionValuesLoader(
        sparqlClient,
        loaders,
        cache,
        cubeFilters?.filters
      );
      const values: DimensionValue[] = await dimensionValuesLoader.load(
        component
      );
      values.sort((a, b) =>
        ascending(
          a.position ?? a.value ?? undefined,
          b.position ?? b.value ?? undefined
        )
      );
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
        values,
        related: data.related,
      };

      if (data.isMeasureDimension) {
        const result: Measure = {
          __typename: resolveMeasureType(component),
          isCurrency: data.isCurrency,
          isDecimal: data.isDecimal,
          currencyExponent: data.currencyExponent,
          resolution: data.resolution,
          ...baseComponent,
        };

        measures.push(result);
      } else {
        const dimensionType = resolveDimensionType(component);
        const hierarchy = true // TODO: make this configurable
          ? await queryHierarchy(
              component,
              locale,
              sparqlClient,
              sparqlClientStream,
              cache,
              // Only pass values if there are no filters, as we need to fetch
              // the full, not filtered hierarchy.
              cubeFilters?.filters ? undefined : values
            )
          : null;
        const baseDimension = {
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
            const dimension: Dimension = {
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

export const dataCubesMetadata: NonNullable<
  QueryResolvers["dataCubesMetadata"]
> = async (_, { locale, filters }, { setup }, info) => {
  const { loaders, sparqlClient } = await setup(info);

  return await Promise.all(
    filters.map(async (filter) => {
      const { iri, latest = true } = filter;
      const rawCube = await loaders.cube.load(iri);

      if (!rawCube) {
        throw new Error("Cube not found!");
      }

      const cube = latest ? await getLatestCube(rawCube) : rawCube;

      return await getCubeMetadata(cube.term?.value!, {
        locale,
        sparqlClient,
      });
    })
  );
};

export const dataCubesObservations: NonNullable<
  QueryResolvers["dataCubesObservations"]
> = async (_, { locale, filters }, { setup }, info) => {
  if (filters.length > 1 && filters.some((f) => f.joinBy === undefined)) {
    throw new Error("Can't query multiple cubes observations without joinBy!");
  }

  const { loaders, sparqlClient, cache } = await setup(info);
  // If the cube was updated, we need to also update the filter with the correct iri.
  const filtersWithCorrectIri: DataCubeObservationFilter[] = [];

  const dataByCubeIri: Record<string, Observation[]> = {};
  const sparqlEditorUrls: DataCubesObservations["sparqlEditorUrls"] = [];

  await Promise.all(
    filters.map(async (filter) => {
      const { iri, latest = true, filters, componentIris } = filter;
      const rawCube = await loaders.cube.load(iri);

      if (!rawCube) {
        throw new Error("Cube not found!");
      }

      const cube = latest ? await getLatestCube(rawCube) : rawCube;
      // TODO: optimize to avoid fetching the shape at all
      await cube.fetchShape();
      filtersWithCorrectIri.push({
        ...filter,
        iri: cube.term?.value!,
      });

      const { query, observations } = await getCubeObservations({
        cube,
        locale,
        sparqlClient,
        filters,
        componentIris,
        cache,
      });

      dataByCubeIri[cube.term?.value!] = observations;
      sparqlEditorUrls.push({
        cubeIri: cube.term?.value!,
        url: getSparqlEditorUrl({
          query,
          dataSource: {
            type: info.variableValues.sourceType,
            url: info.variableValues.sourceUrl,
          },
        }),
      });
    })
  );

  if (filtersWithCorrectIri.length === 1) {
    return {
      data: dataByCubeIri[filtersWithCorrectIri[0].iri],
      sparqlEditorUrls,
    };
  }

  const joinBys = filtersWithCorrectIri.reduce<Record<string, string>>(
    (acc, f) => {
      acc[f.iri] = f.joinBy!;
      return acc;
    },
    {}
  );

  // FIXME: handle situation where we have column of the same name in multiple cubes
  const mergedObservations: Record<string, Observation> = {};
  const keys = Object.entries(dataByCubeIri).flatMap(([_, obs]) => {
    return Object.keys(obs[0]);
  });

  Object.entries(dataByCubeIri).forEach(([cubeIri, observations]) => {
    const joinBy = joinBys[cubeIri];

    observations.forEach((observation) => {
      const key = observation[joinBy];

      if (!key) {
        return;
      }

      const base = keys.reduce<
        Record<string, ObservationValue> & {
          joinBy: NonNullable<ObservationValue>;
        }
      >(
        (acc, d) => {
          acc[d] = null;
          return acc;
        },
        { joinBy: key }
      );

      const existing = mergedObservations[key];
      mergedObservations[key] = Object.assign(existing ?? base, observation);
    });
  });

  return {
    data: Object.values(mergedObservations),
    sparqlEditorUrls,
  };
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
  { preview, limit, filters, componentIris },
  { setup },
  info
) => {
  const { sparqlClient, cache } = await setup(info);
  const { query, observations } = await getCubeObservations({
    cube,
    locale,
    sparqlClient,
    filters,
    preview,
    limit,
    componentIris,
    cache,
  });

  return {
    cube,
    locale,
    data: {
      query,
      observations,
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
