import { ascending, descending } from "d3";
import fuzzaldrin from "fuzzaldrin-plus";
import { GraphQLJSONObject } from "graphql-type-json";
import { parseLocaleString } from "../locales/locales";
import {
  getCube,
  getCubeDimensions,
  getCubeDimensionValues,
  getCubeObservations,
  getCubes,
} from "../rdf/queries";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";
import { ResolvedDimension } from "./shared-types";

const Query: QueryResolvers = {
  dataCubes: async (_, { locale, query, order, includeDrafts }) => {
    const cubes = await getCubes({
      locale: parseLocaleString(locale),
      includeDrafts: includeDrafts ? true : false,
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
          highlightedTitle: fuzzaldrin.wrap(result.title, query, {
            wrap: { tagOpen: "<strong>", tagClose: "</strong>" },
          }),
          highlightedDescription: fuzzaldrin.wrap(result.description, query, {
            wrap: { tagOpen: "<strong>", tagClose: "</strong>" },
          }),
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
  dataCubeByIri: async (_, { iri, locale }) => {
    return getCube({ iri, locale: parseLocaleString(locale) });
  },
};

const DataCube: DataCubeResolvers = {
  iri: ({ data: { iri } }) => iri,
  title: ({ data: { title } }) => title,
  contact: ({ data: { contactPoint } }) => contactPoint ?? null,
  publicationStatus: ({ data: { publicationStatus } }) => publicationStatus,
  description: ({ data: { description } }) => description ?? null,
  source: (dataCube) => "TODO",
  datePublished: ({ data: { datePublished } }) => datePublished ?? null,
  dimensions: async ({ cube, locale }) => {
    const dimensions = getCubeDimensions({
      cube,
      locale,
    });

    return dimensions.filter((d) => !d.data.isNumerical);
  },
  measures: async ({ cube, locale }) => {
    const dimensions = getCubeDimensions({
      cube,
      locale,
    });

    return dimensions.filter((d) => d.data.isNumerical);
  },
  dimensionByIri: async ({ cube, locale }, { iri }) => {
    const dimension = getCubeDimensions({
      cube,
      locale,
    }).find((d) => iri === d.data.iri);

    return dimension ?? null;
  },
  observations: async ({ cube, locale }, { limit, filters, measures }) => {
    const { query, observations, observationsRaw } = await getCubeObservations({
      cube,
      locale,
      filters: filters ?? undefined,
      limit: limit ?? undefined,
    });

    console.log(query);

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
  unit: ({ data: { unit } }: ResolvedDimension) => unit ?? null,
  scaleType: ({ data: { scaleType } }: ResolvedDimension) => scaleType ?? null,
  values: async ({ cube, dimension, locale }: ResolvedDimension) => {
    const values = await getCubeDimensionValues({
      dimension,
      cube,
      locale,
    });
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
  ObservationsQuery: {
    data: async ({ data: { query, observations } }) => observations,
    rawData: async ({ data: { observationsRaw } }) => observationsRaw,
    sparql: async ({ data: { query } }) =>
      query.replace(/\n+/g, " ").replace(/"/g, "'"),
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
  },
  Measure: {
    ...dimensionResolvers,
  },
};
