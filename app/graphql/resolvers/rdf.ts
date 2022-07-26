import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import { keyBy } from "lodash";

import { Filters } from "@/configurator";
import { DimensionValue } from "@/domain/data";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  ObservationFilter,
  DimensionResolvers,
  QueryResolvers,
  Resolvers,
} from "@/graphql/resolver-types";
import { ResolvedDataCube } from "@/graphql/shared-types";
import { defaultLocale, parseLocaleString } from "@/locales/locales";
import { Loaders } from "@/pages/api/graphql";
import {
  createCubeDimensionValuesLoader,
  createSource,
  getCube,
  getCubeDimensions,
  getCubeObservations,
  getCubes as rawGetCubes,
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
import cachedWithTTL from "@/utils/cached-with-ttl";
import { makeCubeIndex as makeCubeIndexRaw, searchCubes } from "@/utils/search";
import truthy from "@/utils/truthy";

const CUBES_CACHE_TTL = 60 * 1000;

const getCubes = cachedWithTTL(
  rawGetCubes,
  ({ filters, includeDrafts, sourceUrl, locale }) =>
    JSON.stringify({ filters, includeDrafts, sourceUrl, locale }),
  CUBES_CACHE_TTL
);

const makeCubeIndex = cachedWithTTL(
  async ({ filters, includeDrafts, sourceUrl, locale }) => {
    const cubes = await getCubes({
      locale: parseLocaleString(locale),
      sourceUrl,
      includeDrafts: includeDrafts ? true : false,
      filters: filters ? filters : undefined,
    });
    const cubesByIri = keyBy(cubes, (c) => c.data.iri);

    const dataCubeCandidates = cubes.map(({ data }) => data);
    const themes = (
      await loadThemes({ locale: locale || defaultLocale })
    ).filter(truthy);
    const organizations = (
      await loadOrganizations({ locale: locale || defaultLocale })
    ).filter(truthy);

    const themeIndex = keyBy(themes, (t) => t.iri);
    const organizationIndex = keyBy(organizations, (o) => o.iri);
    const fullCubes = dataCubeCandidates.map((c) => ({
      ...c,
      creator: c.creator?.iri
        ? {
            ...c.creator,
            label: organizationIndex[c.creator.iri]?.label || "",
          }
        : c.creator,
      themes: c.themes?.map((t) => ({
        ...t,
        label: themeIndex[t.iri]?.label,
      })),
    }));
    return {
      index: makeCubeIndexRaw(fullCubes),
      cubesByIri,
    };
  },
  ({ filters, includeDrafts, sourceUrl, locale }) =>
    JSON.stringify({ filters, includeDrafts, sourceUrl, locale }),
  CUBES_CACHE_TTL
);

export const dataCubes: NonNullable<QueryResolvers["dataCubes"]> = async (
  _,
  { sourceUrl, locale, query, order, includeDrafts, filters }
) => {
  const sortResults = <T extends unknown[]>(
    results: T,
    getter: (d: T[number]) => ResolvedDataCube["data"]
  ) => {
    if (order === DataCubeResultOrder.TitleAsc) {
      results.sort((a: any, b: any) =>
        getter(a).title.localeCompare(getter(b).title, locale ?? undefined)
      );
    } else if (order === DataCubeResultOrder.CreatedDesc) {
      results.sort((a: any, b: any) =>
        descending(getter(a).datePublished, getter(b).datePublished)
      );
    }
  };

  if (query) {
    const { index: cubesIndex, cubesByIri } = await makeCubeIndex({
      locale,
      sourceUrl,
      query,
      order,
      includeDrafts,
      filters,
    });
    const candidates = searchCubes(cubesIndex, query, cubesByIri);
    sortResults(candidates, (x) => x.dataCube.data);

    return candidates;
  } else {
    const cubes = await getCubes({
      locale: parseLocaleString(locale),
      sourceUrl,
      includeDrafts: includeDrafts ? true : false,
      filters: filters ? filters : undefined,
    });

    const dataCubeCandidates = cubes.map(({ data }) => data);
    const cubesByIri = keyBy(cubes, (c) => c.data.iri);
    sortResults(dataCubeCandidates, (x) => x);

    return dataCubeCandidates.map(({ iri }) => {
      const cube = cubesByIri[iri];
      return { dataCube: cube };
    });
  }
};

export const dataCubeByIri: NonNullable<QueryResolvers["dataCubeByIri"]> =
  async (_, { iri, sourceUrl, locale, latest }) => {
    return getCube({
      iri,
      sourceUrl,
      locale: parseLocaleString(locale),
      latest,
    });
  };

export const possibleFilters: NonNullable<QueryResolvers["possibleFilters"]> =
  async (_, { iri, sourceUrl, filters }) => {
    const source = createSource({ endpointUrl: sourceUrl });

    const cube = await source.cube(iri);
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
        filters: queryFilters,
        limit: 1,
        raw: true,
        dimensions: null,
      });
      if (obs.length === 0) {
        continue;
      }
      const unversioned = await unversionObservation({
        datasetIri: iri,
        observation: obs[0],
        cube: cube,
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
  { locale }
) => {
  return (await loadThemes({ locale })).filter(truthy);
};

export const subthemes: NonNullable<QueryResolvers["subthemes"]> = async (
  _,
  { locale, parentIri }
) => {
  return (await loadSubthemes({ locale, parentIri })).filter(truthy);
};

export const organizations: NonNullable<QueryResolvers["organizations"]> =
  async (_, { locale }) => {
    return (await loadOrganizations({ locale })).filter(truthy);
  };

export const datasetcount: NonNullable<QueryResolvers["datasetcount"]> = async (
  _,
  { organization, theme, includeDrafts }
) => {
  const byOrg = await queryDatasetCountByOrganization({
    theme: theme || undefined,
    includeDrafts: includeDrafts ?? undefined,
  });
  const byTheme = await queryDatasetCountByTheme({
    organization: organization || undefined,
    includeDrafts: includeDrafts ?? undefined,
  });
  const bySubTheme = await queryDatasetCountBySubTheme({
    theme: theme || undefined,
    organization: organization || undefined,
    includeDrafts: includeDrafts ?? undefined,
  });
  return [...byOrg, ...byTheme, ...bySubTheme];
};

export const dataCubeDimensions: NonNullable<DataCubeResolvers["dimensions"]> =
  async ({ cube, locale }) => {
    const dimensions = await getCubeDimensions({ cube, locale });
    return dimensions.filter((d) => !d.data.isMeasureDimension);
  };

export const dataCubeMeasures: NonNullable<DataCubeResolvers["measures"]> =
  async ({ cube, locale }) => {
    const dimensions = await getCubeDimensions({ cube, locale });
    return dimensions.filter((d) => d.data.isMeasureDimension);
  };

export const dataCubeDimensionByIri: NonNullable<
  DataCubeResolvers["dimensionByIri"]
> = async ({ cube, locale }, { iri }) => {
  const dimension = (
    await getCubeDimensions({
      cube,
      locale,
    })
  ).find((d) => iri === d.data.iri);

  return dimension ?? null;
};

export const dataCubeObservations: NonNullable<
  DataCubeResolvers["observations"]
> = async ({ cube, locale }, { limit, filters, dimensions }) => {
  const { query, observations, observationsRaw } = await getCubeObservations({
    cube,
    locale,
    filters: filters ?? undefined,
    limit: limit ?? undefined,
    dimensions,
  });

  // const constructedFilters = filters
  //   ? await constructFilters(dataCube, filters)
  //   : [];

  // // TODO: Selecting dimensions explicitly makes the query slower (because labels are only included for selected components). Can this be improved?
  // const unmappedDimensions = (await dataCube.dimensions()).flatMap((d, i) => {
  //   return measures?.find((iri) => iri === d.iri.value)
  //     ? []
  //     : ([[`dim${i}`, d]] as [string, RDFDimension][]);
  // });

  // const selectedFields = [
  //   ...unmappedDimensions,
  //   ...(measures
  //     ? measures.map(
  //         (iri, i) =>
  //           [`comp${i}`, new RDFMeasure({ iri })] as [string, RDFMeasure]
  //       )
  //     : []),
  // ];

  // const query = dataCube
  //   .query()
  //   .limit(limit ?? null)
  //   .select(selectedFields)
  //   .filter(constructedFilters);

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
  loaders: Loaders,
  filters?: Filters | null
): DataLoader<any, any> => {
  let loader: typeof loaders.dimensionValues | undefined;
  const filterKey = filters ? JSON.stringify(filters) : undefined;
  if (filterKey && filters) {
    let existingLoader = loaders.filteredDimensionValues.get(filterKey);
    if (!existingLoader) {
      loader = new DataLoader(createCubeDimensionValuesLoader(filters));
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
  { data: { iri } },
  { sourceUrl },
  context,
  { variableValues: { locale } }
) => {
  return queryHierarchy(iri, sourceUrl, locale);
};

export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async (parent, { filters }, { loaders }) => {
  // Different loader if we have filters or not
  const loader = getDimensionValuesLoader(loaders, filters);
  const values: Array<DimensionValue> = await loader.load(parent);
  // TODO min max are now just `values` with 2 elements. Handle properly!
  return values.sort((a, b) =>
    ascending(
      a.position ?? a.value ?? undefined,
      b.position ?? b.value ?? undefined
    )
  );
};
