import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import ParsingClient from "sparql-http-client/ParsingClient";

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
import { ResolvedDataCube } from "@/graphql/shared-types";
import { parseLocaleString } from "@/locales/locales";
import {
  createCubeDimensionValuesLoader,
  createSource,
  getCube,
  getCubeDimensions,
  getCubeObservations,
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
import { searchCubes } from "@/rdf/query-search";

export const dataCubes: NonNullable<QueryResolvers["dataCubes"]> = async (
  _,
  { sourceUrl, locale, query, order, includeDrafts, filters },
  { setup },
  info
) => {
  const { sparqlClient, sparqlClientStream } = await setup(info);
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

  const candidates = await searchCubes({
    locale,
    includeDrafts,
    filters,
    sparqlClient,
    query,
    sparqlClientStream,
  });
  sortResults(candidates, (x) => x.dataCube.data);
  return candidates;
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
  async (_, { iri, sourceUrl, filters }, { setup }, info) => {
    const { sparqlClient } = await setup(info);
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
        sparqlClient,
        filters: queryFilters,
        limit: 1,
        raw: true,
        dimensions: null,
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
  async ({ cube, locale }, args, { setup }, info) => {
    const { sparqlClient } = await setup(info);
    const dimensions = await getCubeDimensions({ cube, locale, sparqlClient });
    return dimensions.filter((d) => !d.data.isMeasureDimension);
  };

export const dataCubeMeasures: NonNullable<DataCubeResolvers["measures"]> =
  async ({ cube, locale }, args, { setup }, info) => {
    const { sparqlClient } = await setup(info);
    const dimensions = await getCubeDimensions({ cube, locale, sparqlClient });
    return dimensions.filter((d) => d.data.isMeasureDimension);
  };

export const dataCubeDimensionByIri: NonNullable<
  DataCubeResolvers["dimensionByIri"]
> = async ({ cube, locale }, { iri }, { setup }, info) => {
  const { sparqlClient } = await setup(info);
  const dimension = (
    await getCubeDimensions({ cube, locale, sparqlClient })
  ).find((d) => iri === d.data.iri);
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
  const { sparqlClient } = await setup(info);
  const { query, observations, observationsRaw } = await getCubeObservations({
    cube,
    locale,
    sparqlClient,
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
  sparqlClient: ParsingClient,
  loaders: Loaders,
  filters?: Filters | null
): DataLoader<any, any> => {
  let loader: typeof loaders.dimensionValues | undefined;
  const filterKey = filters ? JSON.stringify(filters) : undefined;
  if (filterKey && filters) {
    let existingLoader = loaders.filteredDimensionValues.get(filterKey);
    if (!existingLoader) {
      loader = new DataLoader(
        createCubeDimensionValuesLoader(sparqlClient, filters)
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
  { data: { iri } },
  { sourceUrl },
  { setup },
  info
) => {
  const { sparqlClient, sparqlClientStream } = await setup(info);
  return queryHierarchy(
    iri,
    sourceUrl,
    info.variableValues.locale,
    sparqlClient,
    sparqlClientStream
  );
};

export const dimensionValues: NonNullable<
  NonNullable<Resolvers["Dimension"]>["values"]
> = async (parent, { filters }, { setup }, info) => {
  const { loaders, sparqlClient } = await setup(info);
  // Different loader if we have filters or not
  const loader = getDimensionValuesLoader(sparqlClient, loaders, filters);
  const values: Array<DimensionValue> = await loader.load(parent);

  // TODO min max are now just `values` with 2 elements. Handle properly!
  return values.sort((a, b) =>
    ascending(
      a.position ?? a.value ?? undefined,
      b.position ?? b.value ?? undefined
    )
  );
};
