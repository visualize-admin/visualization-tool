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

// /** Cache value data type per Dimension IRI */
// let dataTypeCache = new Map<string, string | undefined>();
// const getDataTypeOfDimension = async (
//   cube: RDFDataCube,
//   dimension: RDFDimension
// ) => {
//   if (dataTypeCache.has(dimension.iri.value)) {
//     return dataTypeCache.get(dimension.iri.value);
//   }

//   const [exampleValue] = await cube
//     .query()
//     .select({ d: dimension })
//     .limit(1)
//     .execute();

//   const dataType =
//     exampleValue.d.value.termType === "Literal"
//       ? exampleValue.d.value.datatype.value
//       : undefined;

//   dataTypeCache.set(dimension.iri.value, dataType);

//   return dataType;
// };

// const constructFilters = async (cube: RDFDataCube, filters: Filters) => {
//   const dimensions = await cube.dimensions();
//   const dimensionsByIri = dimensions.reduce<
//     Record<string, RDFDimension | undefined>
//   >((acc, d) => {
//     acc[d.iri.value] = d;
//     return acc;
//   }, {});

//   const filterEntries = await Promise.all(
//     Object.entries(filters).map(async ([dimIri, filter]) => {
//       const dimension = dimensionsByIri[dimIri];

//       if (!dimension) {
//         return [];
//       }

//       const dataType = await getDataTypeOfDimension(cube, dimension);

//       const selectedValues =
//         filter.type === "single"
//           ? [dataType ? literal(filter.value, dataType) : filter.value]
//           : filter.type === "multi"
//           ? // If values is an empty object, we filter by something that doesn't exist
//             Object.keys(filter.values).length > 0
//             ? Object.entries(filter.values).flatMap(([value, selected]) =>
//                 selected ? [dataType ? literal(value, dataType) : value] : []
//               )
//             : ["EMPTY_VALUE"]
//           : [];

//       // FIXME: why doesn't .equals work for date types but .in does?
//       // Temporary solution: filter everything usin .in!
//       // return selectedValues.length === 1
//       //   ? [dimension.component.in([toTypedValue(selectedValues[0])])]
//       //   :
//       return selectedValues.length > 0 ? [dimension.in(selectedValues)] : [];
//     })
//   );

//   return ([] as $Unexpressable[]).concat(...filterEntries);
// };

const Query: QueryResolvers = {
  dataCubes: async (_, { locale, query, order }) => {
    const cubes = await getCubes({ locale: parseLocaleString(locale) });

    const dataCubeCandidates = cubes;

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

      return results.map((result) => ({
        dataCube: result,
        highlightedTitle: fuzzaldrin.wrap(result.title, query, {
          wrap: { tagOpen: "<strong>", tagClose: "</strong>" },
        }),
        highlightedDescription: fuzzaldrin.wrap(result.description, query, {
          wrap: { tagOpen: "<strong>", tagClose: "</strong>" },
        }),
        score:
          fuzzaldrin.score(result.title, query) +
          fuzzaldrin.score(result.description, query) * 0.5,
      }));
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

    return dataCubeCandidates.map((dataCube) => ({ dataCube }));
  },
  dataCubeByIri: async (_, { iri, locale }) => {
    return getCube({ iri, locale: parseLocaleString(locale) });
  },
};

const DataCube: DataCubeResolvers = {
  iri: ({ iri }) => iri,
  title: ({ title }) => title,
  contact: ({ contactPoint }) => contactPoint ?? null,
  description: ({ description }) => description ?? null,
  source: (dataCube) => "TODO",
  datePublished: ({ datePublished }) => datePublished ?? null,
  dimensions: async ({ dataCube, locale }) => {
    const dimensions = getCubeDimensions({
      cube: dataCube,
      locale,
    });

    return dimensions.filter((d) => !d.isNumerical);
  },
  measures: async ({ dataCube, locale }) => {
    const dimensions = getCubeDimensions({
      cube: dataCube,
      locale,
    });

    return dimensions.filter((d) => d.isNumerical);
  },
  dimensionByIri: async ({ dataCube, locale }, { iri }) => {
    const dimension = getCubeDimensions({
      cube: dataCube,
      locale,
    }).find((d) => iri === d.iri);

    return dimension ?? null;
  },
  observations: async ({ dataCube, locale }, { limit, filters, measures }) => {
    const { query, observations, observationsRaw } = await getCubeObservations({
      cube: dataCube,
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
      dataCube,
      query,
      observations,
      observationsRaw,
      selectedFields: [],
    };
  },
};

const dimensionResolvers = {
  iri: ({ iri }: ResolvedDimension) => iri,
  label: ({ name }: ResolvedDimension) => name,
  unit: ({ unit }: ResolvedDimension) => unit ?? null,
  scaleType: ({ scaleType }: ResolvedDimension) => scaleType ?? null,
  values: async ({ dataCube, dimension, locale }: ResolvedDimension) => {
    const values = await getCubeDimensionValues({
      dimension,
      cube: dataCube,
      locale,
    });
    // TODO min max are now just `values` with 2 elements. Handle properly!
    return values.sort((a, b) => ascending(a.value, b.value));
  },
};

export const resolvers: Resolvers = {
  Filters: GraphQLJSONObject,
  Observation: GraphQLJSONObject,
  RawObservation: GraphQLJSONObject,
  Query,
  DataCube,
  ObservationsQuery: {
    data: async ({ query, observations }) => observations,
    rawData: async ({ observationsRaw }) => observationsRaw,
    sparql: async ({ query }) => query.replace(/\n+/g, " ").replace(/"/g, "'"),
  },
  Dimension: {
    __resolveType({ dataKind, scaleType, dataType }) {
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
