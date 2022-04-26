import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import { GraphQLJSONObject } from "graphql-type-json";
import { keyBy } from "lodash";
import { topology } from "topojson-server";
import { parse as parseWKT } from "wellknown";

import { Filters } from "../configurator";
import {
  DimensionValue,
  GeoFeature,
  GeoProperties,
  GeoShapes,
} from "../domain/data";
import { defaultLocale, parseLocaleString } from "../locales/locales";
import { Loaders } from "../pages/api/graphql";
import {
  createCubeDimensionValuesLoader,
  createSource,
  getCube,
  getCubeDimensions,
  getCubeObservations,
  getCubes as rawGetCubes,
  getSparqlEditorUrl,
} from "../rdf/queries";
import {
  loadOrganizations,
  loadSubthemes,
  loadThemes,
  queryDatasetCountByOrganization,
  queryDatasetCountBySubTheme,
  queryDatasetCountByTheme,
} from "../rdf/query-cube-metadata";
import { unversionObservation } from "../rdf/query-dimension-values";
import { RawGeoShape } from "../rdf/query-geo-shapes";
import cachedWithTTL from "../utils/cached-with-ttl";
import {
  makeCubeIndex as makeCubeIndexRaw,
  searchCubes,
} from "../utils/search";
import truthy from "../utils/truthy";

import { ObservationFilter } from "./query-hooks";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";
import { ResolvedDataCube, ResolvedDimension } from "./shared-types";

const CUBES_CACHE_TTL = 60 * 1000;

const getCubes = cachedWithTTL(
  rawGetCubes,
  ({ filters, includeDrafts, locale }) =>
    JSON.stringify({ filters, includeDrafts, locale }),
  CUBES_CACHE_TTL
);

const makeCubeIndex = cachedWithTTL(
  async ({ filters, includeDrafts, locale }) => {
    const cubes = await getCubes({
      locale: parseLocaleString(locale),
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
  ({ filters, includeDrafts, locale }) =>
    JSON.stringify({ filters, includeDrafts, locale }),
  CUBES_CACHE_TTL
);

export const Query: QueryResolvers = {
  possibleFilters: async (_, { iri, filters }) => {
    const source = createSource();

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
  },

  dataCubes: async (_, { locale, query, order, includeDrafts, filters }) => {
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
  },

  dataCubeByIri: async (_, { iri, locale, latest }) => {
    return getCube({
      iri,
      locale: parseLocaleString(locale),
      latest,
    });
  },
  themes: async (_, { locale }: { locale: string }) => {
    return (await loadThemes({ locale })).filter(truthy);
  },
  subthemes: async (
    _,
    { locale, parentIri }: { locale: string; parentIri: string }
  ) => {
    return (await loadSubthemes({ locale, parentIri })).filter(truthy);
  },
  organizations: async (_, { locale }: { locale: string }) => {
    return (await loadOrganizations({ locale })).filter(truthy);
  },
  datasetcount: async (_, { organization, theme, includeDrafts }) => {
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
  },
};

const DataCube: DataCubeResolvers = {
  iri: ({ data: { iri } }) => iri,
  title: ({ data: { title } }) => title,
  version: ({ data: { version } }) => version ?? null,
  publisher: ({ data: { publisher } }) => publisher ?? null,
  contactName: ({ data: { contactPoint } }) => contactPoint?.name ?? null,
  contactEmail: ({ data: { contactPoint } }) => contactPoint?.email ?? null,
  landingPage: ({ data: { landingPage } }) => landingPage ?? null,
  expires: ({ data: { expires } }) => expires ?? null,
  publicationStatus: ({ data: { publicationStatus } }) => publicationStatus,
  description: ({ data: { description } }) => description ?? null,
  datePublished: ({ data: { datePublished } }) => datePublished ?? null,
  themes: ({ data: { themes } }) => themes || [],
  creator: ({ data: { creator } }) => creator ?? null,
  dimensions: async ({ cube, locale }) => {
    const dimensions = await getCubeDimensions({
      cube,
      locale,
    });

    return dimensions.filter((d) => !d.data.isMeasureDimension);
  },
  measures: async ({ cube, locale }) => {
    const dimensions = await getCubeDimensions({
      cube,
      locale,
    });

    return dimensions.filter((d) => d.data.isMeasureDimension);
  },
  dimensionByIri: async ({ cube, locale }, { iri }) => {
    const dimension = (
      await getCubeDimensions({
        cube,
        locale,
      })
    ).find((d) => iri === d.data.iri);

    return dimension ?? null;
  },
  observations: async ({ cube, locale }, { limit, filters, dimensions }) => {
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
  },
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

const mkDimensionResolvers = (debugName: string) => ({
  iri: ({ data: { iri } }: ResolvedDimension) => iri,
  label: ({ data: { name } }: ResolvedDimension) => name,
  related: ({ data: { related } }: ResolvedDimension) => related,
  isNumerical: ({ data: { isNumerical } }: ResolvedDimension) => isNumerical,
  isKeyDimension: ({ data: { isKeyDimension } }: ResolvedDimension) =>
    isKeyDimension,
  unit: ({ data: { unit } }: ResolvedDimension) => unit ?? null,
  scaleType: ({ data: { scaleType } }: ResolvedDimension) => scaleType ?? null,
  values: async (
    parent: ResolvedDimension,
    { filters }: { filters?: Filters | null },
    { loaders }: { loaders: Loaders }
  ) => {
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
  },
});

export const resolvers: Resolvers = {
  Filters: GraphQLJSONObject,
  Observation: GraphQLJSONObject,
  DimensionValue: GraphQLJSONObject,
  RawObservation: GraphQLJSONObject,
  Query,
  DataCube,
  DataCubeTheme: {
    // Loads theme with dataloader if we need the label
    label: async (parent, _, { loaders }) => {
      if (!parent.label) {
        const resolvedTheme = await loaders.themes.load(parent.iri);
        return resolvedTheme.label;
      }
      return parent.label;
    },
  },
  DataCubeOrganization: {
    label: async (parent, _, { loaders }) => {
      if (!parent.label) {
        const resolvedTheme = await loaders.organizations.load(parent.iri);
        return resolvedTheme.label;
      }
      return parent.label;
    },
  },
  ObservationsQuery: {
    data: async ({ data: { query, observations } }) => observations,
    rawData: async ({ data: { observationsRaw } }) => observationsRaw,
    sparql: async ({ data: { query } }) =>
      query.replace(/\n+/g, " ").replace(/"/g, "'"),
    sparqlEditorUrl: async ({ data: { query } }) =>
      getSparqlEditorUrl({ query }),
  },
  Dimension: {
    __resolveType({ data: { dataKind, scaleType, dataType } }) {
      if (dataKind === "Time") {
        return "TemporalDimension";
      } else if (dataKind === "GeoCoordinates") {
        return "GeoCoordinatesDimension";
      } else if (dataKind === "GeoShape") {
        return "GeoShapesDimension";
      }

      if (scaleType === "Ordinal") {
        return "OrdinalDimension";
      }

      return "NominalDimension";
    },
  },
  NominalDimension: {
    ...mkDimensionResolvers("nominal"),
  },
  OrdinalDimension: {
    ...mkDimensionResolvers("ordinal"),
  },
  TemporalDimension: {
    ...mkDimensionResolvers("temporal"),
    timeUnit: ({ data: { timeUnit } }) => timeUnit!,
    timeFormat: ({ data: { timeFormat } }) => timeFormat!,
  },
  GeoCoordinatesDimension: {
    ...mkDimensionResolvers("geocoordinates"),
    geoCoordinates: async (parent, _, { loaders }) => {
      return await loaders.geoCoordinates.load(parent);
    },
  },
  GeoShapesDimension: {
    ...mkDimensionResolvers("geoshapes"),
    geoShapes: async (parent, _, { loaders }) => {
      const dimValues = (await loaders.dimensionValues.load(
        parent
      )) as DimensionValue[];
      const dimIris = dimValues.map((d) => `${d.value}`) as string[];
      const shapes = (await loaders.geoShapes.loadMany(
        dimIris
      )) as RawGeoShape[];
      const geoJSONFeatures = shapes
        .filter(
          (d): d is Exclude<RawGeoShape, "wktString"> & { wktString: string } =>
            d.wktString !== undefined
        )
        .map((d) => ({
          type: "Feature",
          properties: {
            iri: d.iri,
            label: d.label,
            hierarchyLevel: d.level,
          },
          geometry: parseWKT(d.wktString),
        })) as GeoFeature[];

      const resolved: GeoShapes = {
        topology: topology({
          shapes: {
            type: "FeatureCollection",
            features: geoJSONFeatures,
          } as GeoJSON.FeatureCollection<GeoJSON.Geometry, GeoProperties>,
        }) as GeoShapes["topology"],
      };

      return resolved;
    },
  },
  Measure: {
    ...mkDimensionResolvers("measure"),
  },
};
