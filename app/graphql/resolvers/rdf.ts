import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import ParsingClient from "sparql-http-client/ParsingClient";
import { LRUCache } from "typescript-lru-cache";

import { Filters } from "@/configurator";
import { DimensionValue } from "@/domain/data";
import { truthy } from "@/domain/types";
import { Loaders } from "@/graphql/context";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  ObservationFilter,
  DimensionResolvers,
  QueryResolvers,
  Resolvers,
} from "@/graphql/resolver-types";
import {
  createCubeDimensionValuesLoader,
  getCubeDimensions,
  getCubeObservations,
  getResolvedCube,
} from "@/rdf/queries";
import {
  loadOrganizations,
  loadSubthemes,
  loadThemes,
  queryDatasetCountByOrganization,
  queryDatasetCountBySubTheme,
  queryDatasetCountByTheme,
} from "@/rdf/query-cube-metadata";
import { unversionObservation } from "@/rdf/query-dimension-values";
import { queryHierarchy } from "@/rdf/query-hierarchies";
import { SearchResult, searchCubes } from "@/rdf/query-search";

const sortResults = (
  results: SearchResult[],
  order: DataCubeResultOrder | undefined | null,
  locale: string | undefined | null
): SearchResult[] => {
  const getCube = (r: SearchResult) => r.dataCube.data;
  switch (order) {
    case DataCubeResultOrder.TitleAsc:
      results.sort((a, b) =>
        getCube(a).title.localeCompare(getCube(b).title, locale ?? undefined)
      );
      break;
    case DataCubeResultOrder.CreatedDesc:
    case undefined:
    case null:
      results.sort((a, b) => {
        const ra = getCube(a).datePublished || "0";
        const rb = getCube(b).datePublished || "0";
        return descending(ra, rb);
      });
      break;
    case DataCubeResultOrder.Score:
      break;
    default:
      const exhaustCheck = order;
      return exhaustCheck;
  }
  return results;
};

export const dataCubes: NonNullable<QueryResolvers["dataCubes"]> = async (
  _,
  { locale, query, order, includeDrafts, filters },
  { setup, queries },
  info
) => {
  const { sparqlClient, sparqlClientStream } = await setup(info);

  const { candidates, meta } = await searchCubes({
    locale,
    includeDrafts,
    filters,
    sparqlClient,
    query,
    sparqlClientStream,
  });

  for (let query of meta.queries) {
    queries.push(query);
  }

  sortResults(candidates, order, locale);
  return candidates;
};

export const dataCubeByIri: NonNullable<QueryResolvers["dataCubeByIri"]> =
  async (_, { iri, locale, latest }, { setup }, info) => {
    const { loaders } = await setup(info);
    const cube = await loaders.cube.load(iri);

    if (!cube) {
      throw new Error("Cube not found");
    }

    return getResolvedCube({ cube, locale: locale || "de", latest });
  };

export const possibleFilters: NonNullable<QueryResolvers["possibleFilters"]> =
  async (_, { iri, filters }, { setup }, info) => {
    const { sparqlClient, loaders, cache } = await setup(info);

    const cube = await loaders.cube.load(iri);
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
        dimensions: null,
        cache,
      });
      if (obs.length === 0) {
        continue;
      }
      const unversioned = await unversionObservation({
        observation: obs[0],
        cube: cube,
        sparqlClient,
      });
      const ret = Object.keys(filters).map((f) => ({
        iri: f,
        type: "single",
        // TODO figure out why I need to do the as here
        value: unversioned[f] as ObservationFilter["value"],
      }));
      return ret;
    }
    return [];
  };

export const themes: NonNullable<QueryResolvers["themes"]> = async (
  _,
  { locale },
  { setup },
  info
) => {
  const { sparqlClient } = await setup(info);
  return (await loadThemes({ locale, sparqlClient })).filter(truthy);
};

export const subthemes: NonNullable<QueryResolvers["subthemes"]> = async (
  _,
  { locale, parentIri },
  { setup },
  info
) => {
  const { sparqlClient } = await setup(info);
  return (await loadSubthemes({ locale, parentIri, sparqlClient })).filter(
    truthy
  );
};

export const organizations: NonNullable<QueryResolvers["organizations"]> =
  async (_, { locale }, { setup }, info) => {
    const { sparqlClient } = await setup(info);
    return (await loadOrganizations({ locale, sparqlClient })).filter(truthy);
  };

export const datasetcount: NonNullable<QueryResolvers["datasetcount"]> = async (
  _,
  { organization, theme, includeDrafts },
  { setup },
  info
) => {
  const { sparqlClient } = await setup(info);
  const byOrg = await queryDatasetCountByOrganization({
    theme: theme || undefined,
    includeDrafts: includeDrafts ?? undefined,
    sparqlClient,
  });
  const byTheme = await queryDatasetCountByTheme({
    organization: organization || undefined,
    includeDrafts: includeDrafts ?? undefined,
    sparqlClient,
  });
  const bySubTheme = await queryDatasetCountBySubTheme({
    theme: theme || undefined,
    organization: organization || undefined,
    includeDrafts: includeDrafts ?? undefined,
    sparqlClient,
  });
  return [...byOrg, ...byTheme, ...bySubTheme];
};

export const dataCubeDimensions: NonNullable<DataCubeResolvers["dimensions"]> =
  async ({ cube, locale }, _, { setup }, info) => {
    const { sparqlClient, cache } = await setup(info);
    const dimensions = await getCubeDimensions({
      cube,
      locale,
      sparqlClient,
      cache,
    });
    return dimensions.filter((d) => !d.data.isMeasureDimension);
  };

export const dataCubeMeasures: NonNullable<DataCubeResolvers["measures"]> =
  async ({ cube, locale }, _, { setup }, info) => {
    const { sparqlClient, cache } = await setup(info);
    const dimensions = await getCubeDimensions({
      cube,
      locale,
      sparqlClient,
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
    dimensionIris: [iri],
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
  { limit, filters, dimensions },
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
    dimensions,
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
  const filterKey = filters ? JSON.stringify(filters) : undefined;
  if (filterKey && filters) {
    let existingLoader = loaders.filteredDimensionValues.get(filterKey);
    if (!existingLoader) {
      loader = new DataLoader(
        createCubeDimensionValuesLoader(sparqlClient, cache, filters)
      );
      loaders.filteredDimensionValues.set(filterKey, loader);
      return loader;
    } else {
      return existingLoader;
    }
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

  const res = await queryHierarchy(
    rdimension,
    locale,
    sparqlClient,
    sparqlClientStream,
    cache
  );

  return res;
};

export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async (parent, { filters }, { setup }, info) => {
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
