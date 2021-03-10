import { literal } from "@rdfjs/data-model";
import {
  DataCube as RDFDataCube,
  DataCubeEntryPoint,
  Dimension as RDFDimension,
  Measure as RDFMeasure,
} from "@zazuko/query-rdf-data-cube";
import { ascending, descending } from "d3";
import fuzzaldrin from "fuzzaldrin-plus";
import { GraphQLJSONObject } from "graphql-type-json";
import { Filters } from "../configurator";
import { parseObservationValue } from "../domain/data";
import { SPARQL_ENDPOINT } from "../domain/env";
import { locales, parseLocaleString } from "../locales/locales";
import { getCube, getCubes } from "../rdf/queries";
import {
  DataCubeResolvers,
  DataCubeResultOrder,
  QueryResolvers,
  Resolvers,
} from "./resolver-types";
import { ResolvedDimension, ResolvedMeasure } from "./shared-types";

/** Cache value data type per Dimension IRI */
let dataTypeCache = new Map<string, string | undefined>();
const getDataTypeOfDimension = async (
  cube: RDFDataCube,
  dimension: RDFDimension
) => {
  if (dataTypeCache.has(dimension.iri.value)) {
    return dataTypeCache.get(dimension.iri.value);
  }

  const [exampleValue] = await cube
    .query()
    .select({ d: dimension })
    .limit(1)
    .execute();

  const dataType =
    exampleValue.d.value.termType === "Literal"
      ? exampleValue.d.value.datatype.value
      : undefined;

  dataTypeCache.set(dimension.iri.value, dataType);

  return dataType;
};

const constructFilters = async (cube: RDFDataCube, filters: Filters) => {
  const dimensions = await cube.dimensions();
  const dimensionsByIri = dimensions.reduce<
    Record<string, RDFDimension | undefined>
  >((acc, d) => {
    acc[d.iri.value] = d;
    return acc;
  }, {});

  const filterEntries = await Promise.all(
    Object.entries(filters).map(async ([dimIri, filter]) => {
      const dimension = dimensionsByIri[dimIri];

      if (!dimension) {
        return [];
      }

      const dataType = await getDataTypeOfDimension(cube, dimension);

      const selectedValues =
        filter.type === "single"
          ? [dataType ? literal(filter.value, dataType) : filter.value]
          : filter.type === "multi"
          ? // If values is an empty object, we filter by something that doesn't exist
            Object.keys(filter.values).length > 0
            ? Object.entries(filter.values).flatMap(([value, selected]) =>
                selected ? [dataType ? literal(value, dataType) : value] : []
              )
            : ["EMPTY_VALUE"]
          : [];

      // FIXME: why doesn't .equals work for date types but .in does?
      // Temporary solution: filter everything usin .in!
      // return selectedValues.length === 1
      //   ? [dimension.component.in([toTypedValue(selectedValues[0])])]
      //   :
      return selectedValues.length > 0 ? [dimension.in(selectedValues)] : [];
    })
  );

  return ([] as $Unexpressable[]).concat(...filterEntries);
};

const Query: QueryResolvers = {
  dataCubes: async (_, { locale, query, order }) => {
    const cubes = await getCubes({ locale });

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
        results.sort((a, b) => descending(a.created, b.created));
      }

      return results.map((result) => ({
        dataCube: result.dataCube,
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
      dataCubeCandidates.sort((a, b) => descending(a.created, b.created));
    }

    return dataCubeCandidates.map((dataCube) => ({ dataCube }));
  },
  dataCubeByIri: async (_, { iri, locale }) => {
    return getCube({ iri, locale });
  },
};

const DataCube: DataCubeResolvers = {
  iri: ({ iri }) => iri ?? "---",
  title: ({ title }) => title ?? "---",
  contact: ({ contactPoint }) => contactPoint ?? null,
  description: ({ description }) => description ?? null,
  source: (dataCube) => "TODO",
  dateCreated: (dataCube) => "TODO",
  dimensions: async (dataCube) => {
    return (await dataCube.dimensions()).map((dimension) => ({
      dataCube,
      dimension,
    }));
  },
  dimensionByIri: async (dataCube, { iri }) => {
    const dimension = (await dataCube.dimensions()).find(
      (dimension) => dimension.iri.value === iri
    );
    return dimension
      ? {
          dataCube,
          dimension,
        }
      : null;
  },
  measures: async (dataCube) => {
    return (await dataCube.measures()).map((measure) => ({
      dataCube,
      measure,
    }));
  },
  observations: async (dataCube, { limit, filters, measures }) => {
    const constructedFilters = filters
      ? await constructFilters(dataCube, filters)
      : [];

    // TODO: Selecting dimensions explicitly makes the query slower (because labels are only included for selected components). Can this be improved?
    const unmappedDimensions = (await dataCube.dimensions()).flatMap((d, i) => {
      return measures?.find((iri) => iri === d.iri.value)
        ? []
        : ([[`dim${i}`, d]] as [string, RDFDimension][]);
    });

    const selectedFields = [
      ...unmappedDimensions,
      ...(measures
        ? measures.map(
            (iri, i) =>
              [`comp${i}`, new RDFMeasure({ iri })] as [string, RDFMeasure]
          )
        : []),
    ];

    const query = dataCube
      .query()
      .limit(limit ?? null)
      .select(selectedFields)
      .filter(constructedFilters);

    return {
      dataCube,
      query,
      selectedFields,
    };
  },
};

const dimensionResolvers = {
  iri: ({ dimension }: ResolvedDimension) => dimension.iri.value,
  label: ({ dimension }: ResolvedDimension) => dimension.label.value,
  values: async ({ dataCube, dimension }: ResolvedDimension) => {
    const values = await dataCube.componentValues(dimension);
    return values
      .map(({ value, label }) => {
        return {
          value: value.value,
          label: label.value !== "" ? label.value : value.value,
        };
      })
      .sort((a, b) => ascending(a.value, b.value));
  },
};

export const resolvers: Resolvers = {
  Filters: GraphQLJSONObject,
  Observation: GraphQLJSONObject,
  RawObservation: GraphQLJSONObject,
  Query,
  DataCube,
  ObservationsQuery: {
    data: async ({ query, selectedFields }) => {
      const observations = await query.execute();
      // TODO: Optimize Performance
      const fullyQualifiedObservations = observations.map((obs) => {
        return Object.fromEntries(
          Object.entries(obs).map(([k, v]) => {
            return [
              selectedFields.find(([selK]) => selK === k)![1].iri.value,
              // FIXME: This undefined check should not be necessary but prevents breaking on some malformed RDF(?) values
              v && v.value !== undefined ? parseObservationValue(v) : 0,
            ];
          })
        );
      });

      return fullyQualifiedObservations;
    },
    rawData: async ({ query, selectedFields }) => {
      const observations = await query.execute();
      // TODO: Optimize Performance
      const fullyQualifiedObservations = observations.map((obs) => {
        return Object.fromEntries(
          Object.entries(obs).map(([k, v]) => [
            selectedFields.find(([selK]) => selK === k)![1].iri.value,
            v,
          ])
        );
      });

      return fullyQualifiedObservations;
    },
    sparql: async ({ query }) => {
      return query.toSparql();
    },
  },
  Dimension: {
    __resolveType({ dimension }) {
      const scaleOfMeasure = dimension.extraMetadata.scaleOfMeasure;

      if (
        scaleOfMeasure &&
        /cube\/scale\/Temporal\/?$/.test(scaleOfMeasure.value)
      ) {
        return "TemporalDimension";
      }

      // FIXME: Remove this once we're sure that scaleOfMeasure always works
      if (
        /(Jahr|Année|Anno|Year|Zeit|Time|Temps|Tempo)/i.test(
          dimension.label.value
        )
      ) {
        return "TemporalDimension";
      }

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
    iri: ({ measure }: ResolvedMeasure) => measure.iri.value,
    label: ({ measure }: ResolvedMeasure) => measure.label.value,
  },
};
