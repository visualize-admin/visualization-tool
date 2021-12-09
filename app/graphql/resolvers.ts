import { ascending, descending } from "d3";
import DataLoader from "dataloader";
import { GraphQLJSONObject } from "graphql-type-json";
import { topology } from "topojson-server";
import { parse as parseWKT } from "wellknown";
import { Filters } from "../configurator";
import {
  DimensionValue,
  GeoFeature,
  GeoProperties,
  GeoShapes,
} from "../domain/data";

import Fuse from "fuse.js";
import { flatten, keyBy } from "lodash";
import lunr from "lunr";
import { parseLocaleString } from "../locales/locales";
import { Loaders } from "../pages/api/graphql";
import {
  createCubeDimensionValuesLoader,
  createSource,
  getCube,
  getCubeDimensions,
  getCubeObservations,
  getCubes,
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
import { wrap } from "../utils/search";
import truthy from "../utils/truthy";
import { ObservationFilter } from "./query-hooks";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";
import { ResolvedDataCube, ResolvedDimension } from "./shared-types";

const searchWithFuse = (
  cubesByIri: Record<string, ResolvedDataCube>,
  cubesData: ResolvedDataCube["data"][],
  query: string
) => {
  const index = new Fuse(cubesData, {
    includeScore: true,
    includeMatches: true,
    findAllMatches: false,
    minMatchCharLength: 3,
    ignoreLocation: true,
    keys: [
      {
        name: "title",
        weight: 2,
      },
      "description",
    ],
  });

  const results = index.search(query);

  return results
    .filter((r) => (r.score as number) < 0.25)
    .map((result) => {
      const { item, score, matches: rawMatches } = result;
      const matches = rawMatches?.map((m) => {
        const perfectMatchIndex = m.indices.findIndex(([start, end]) => {
          const part = m.value?.substring(start, end + 1).toLowerCase();
          return part === query.toLowerCase();
        });
        if (perfectMatchIndex > -1) {
          return { ...m, indices: [m.indices[perfectMatchIndex]] };
        }
        return m;
      });
      const titleMatch = matches?.find((m) => m.key === "title");
      const descriptionMatch = matches?.find((m) => m.key === "description");

      const highlightedTitle = highlightMatch(titleMatch);
      const highlightedDescription = highlightMatch(descriptionMatch);
      return {
        dataCube: cubesByIri[item.iri],
        score,
        highlightedDescription,
        highlightedTitle,
      };
    });
};

const searchWithLunr = (
  cubesByIri: Record<string, ResolvedDataCube>,
  cubesData: ResolvedDataCube["data"][],
  searchTerm: string
) => {
  var idx = lunr(function () {
    const self = this;
    self.ref("iri");
    self.field("title", { boost: 2 });
    self.field("description");
    self.metadataWhitelist = ["position"];

    cubesData.forEach(function (doc) {
      self.add(doc);
    }, this);
  });

  const results = idx.query((q) => {
    // exact matches should have the highest boost
    q.term(searchTerm, { boost: 100 });

    // prefix matches should be boosted slightly
    q.term(searchTerm, {
      boost: 10,
      usePipeline: false,
      wildcard: lunr.Query.wildcard.TRAILING,
    });

    // finally, try a fuzzy search, without any boost
    q.term(searchTerm, { boost: 1, usePipeline: false, editDistance: 1 });
  });

  return results.map((result) => {
    const cube = cubesByIri[result.ref];
    const titleMatchPositions = flatten(
      Object.values(result.matchData.metadata)
        .filter((o) => o.title)
        .map((o) => o.title.position)
    ).map(([start, length]) => [start, start + length - 1] as [number, number]);
    const descriptionMatchPositions = flatten(
      Object.values(result.matchData.metadata)
        .filter((o) => o.description)
        .map((o) => o.description.position)
    ).map(([start, length]) => [start, start + length - 1] as [number, number]);
    const highlightedTitle = highlightMatch({
      value: cube.data.title,
      indices: titleMatchPositions,
    });
    const highlightedDescription = highlightMatch({
      value: cube.data.description,
      indices: descriptionMatchPositions,
    });
    return { dataCube: cube, highlightedTitle, highlightedDescription };
  });
};

const highlightMatch = (match?: Fuse.FuseResultMatch) => {
  return match?.value
    ? wrap(match.value, match.indices, {
        tagOpen: "<strong>",
        tagClose: "</strong>",
      })
    : "";
};

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
    const cubes = await getCubes({
      locale: parseLocaleString(locale),
      includeDrafts: includeDrafts ? true : false,
      filters: filters ? filters : undefined,
    });

    const dataCubeCandidates = cubes.map(({ data }) => data);
    const cubesByIri = keyBy(cubes, (c) => c.data.iri);

    if (query) {
      return searchWithLunr(cubesByIri, dataCubeCandidates, query);
    }

    if (order === DataCubeResultOrder.TitleAsc) {
      dataCubeCandidates.sort((a, b) =>
        a.title.localeCompare(b.title, locale ?? undefined)
      );
    } else if (order === DataCubeResultOrder.CreatedDesc) {
      dataCubeCandidates.sort((a, b) =>
        descending(a.datePublished, b.datePublished)
      );
    }

    return dataCubeCandidates.map(({ iri }) => {
      const cube = cubesByIri[iri];
      return { dataCube: cube };
    });
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
