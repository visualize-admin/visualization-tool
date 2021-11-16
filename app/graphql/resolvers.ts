import { ascending, descending } from "d3";
import fuzzaldrin from "fuzzaldrin-plus";
import { GraphQLJSONObject } from "graphql-type-json";
import { keyBy, merge } from "lodash";
import { resolve } from "path";
import { parseLocaleString } from "../locales/locales";
import {
  getCube,
  getCubeDimensions,
  getCubeDimensionValues,
  getCubeObservations,
  getCubes,
  getSparqlEditorUrl,
} from "../rdf/queries";
import {
  loadOrganizations,
  loadSubthemes,
  loadThemes,
  queryDatasetCountByOrganization,
  queryDatasetCountByTheme,
} from "../rdf/query-cube-metadata";
import truthy from "../utils/truthy";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";
import { ResolvedDimension } from "./shared-types";

const Query: QueryResolvers = {
  dataCubes: async (_, { locale, query, order, includeDrafts, filters }) => {
    const cubes = await getCubes({
      locale: parseLocaleString(locale),
      includeDrafts: includeDrafts ? true : false,
      filters: filters ? filters : undefined,
    });

    const dataCubeCandidates = cubes.map(({ data }) => data);

    if (query) {
      /**
       * This uses https://github.com/jeancroy/fuzz-aldrin-plus which is a re-implementation of the Atom editor file picker algorithm
       *
       * Alternatives:
       * - https://github.com/kentcdodds/match-sorter looks nice, but does not support highlighting results.
       * - https://fusejs.io/ tried out but result matching is a bit too random (order of letters seems to be ignored). Whole-word matches don't support highlighting and scoring for some reason.
       */

      const titleResults = fuzzaldrin.filter(dataCubeCandidates, `${query}`, {
        key: "title",
      });

      const descriptionResults = fuzzaldrin.filter(
        dataCubeCandidates,
        `${query}`,
        { key: "description" }
      );

      const results = Array.from(
        new Set([...titleResults, ...descriptionResults])
      );

      if (order == null || order === DataCubeResultOrder.Score) {
        results.sort((a, b) => {
          return (
            fuzzaldrin.score(b.title, query) +
            fuzzaldrin.score(b.description, query) * 0.5 -
            (fuzzaldrin.score(a.title, query) +
              fuzzaldrin.score(a.description, query) * 0.5)
          );
        });
      } else if (order === DataCubeResultOrder.TitleAsc) {
        results.sort((a, b) =>
          a.title.localeCompare(b.title, locale ?? undefined)
        );
      } else if (order === DataCubeResultOrder.CreatedDesc) {
        results.sort((a, b) => descending(a.datePublished, b.datePublished));
      }

      return results.map((result) => {
        const cube = cubes.find((c) => c.data.iri === result.iri)!;
        return {
          dataCube: cube,
          highlightedTitle: result.title
            ? fuzzaldrin.wrap(result.title, query, {
                wrap: { tagOpen: "<strong>", tagClose: "</strong>" },
              })
            : "",
          highlightedDescription: result.description
            ? fuzzaldrin.wrap(result.description, query, {
                wrap: { tagOpen: "<strong>", tagClose: "</strong>" },
              })
            : "",
          score:
            fuzzaldrin.score(result.title, query) +
            fuzzaldrin.score(result.description, query) * 0.5,
        };
      });
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
      const cube = cubes.find((c) => c.data.iri === iri)!;
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
  datasetcount: async (_, { organization, theme, subtheme }) => {
    const byOrg = await queryDatasetCountByOrganization({
      theme: theme || undefined,
    });
    const byTheme = await queryDatasetCountByTheme({
      organization: organization || undefined,
    });
    return [...byOrg, ...byTheme];
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
  observations: async ({ cube, locale }, { limit, filters, measures }) => {
    const { query, observations, observationsRaw } = await getCubeObservations({
      cube,
      locale,
      filters: filters ?? undefined,
      limit: limit ?? undefined,
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

const dimensionResolvers = {
  iri: ({ data: { iri } }: ResolvedDimension) => iri,
  label: ({ data: { name } }: ResolvedDimension) => name,
  isKeyDimension: ({ data: { isKeyDimension } }: ResolvedDimension) =>
    isKeyDimension,
  unit: ({ data: { unit } }: ResolvedDimension) => unit ?? null,
  scaleType: ({ data: { scaleType } }: ResolvedDimension) => scaleType ?? null,
  values: async (dimension: ResolvedDimension) => {
    const values = await getCubeDimensionValues(dimension);
    // TODO min max are now just `values` with 2 elements. Handle properly!
    return values.sort((a, b) =>
      ascending(a.value ?? undefined, b.value ?? undefined)
    );
  },
};

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
      }

      // TODO: GeoDimension
      // if (dataKind === "https://schema.org/GeoShape") {
      // return "GeoDimension"
      // }

      return "NominalDimension";
    },
  },
  NominalDimension: {
    ...dimensionResolvers,
  },
  OrdinalDimension: {
    ...dimensionResolvers,
  },
  TemporalDimension: {
    ...dimensionResolvers,
    timeUnit: ({ data: { timeUnit } }: ResolvedDimension) => timeUnit!,
    timeFormat: ({ data: { timeFormat } }: ResolvedDimension) => timeFormat!,
  },
  Measure: {
    ...dimensionResolvers,
  },
};
