import { GraphQLScalarType } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";

import { MeasureType } from "@/configurator";
import { DimensionType } from "@/domain/data";
import {
  DataCubeResolvers,
  QueryResolvers,
  Resolvers,
  ScaleType,
  TimeUnit,
} from "@/graphql/resolver-types";
import * as RDF from "@/graphql/resolvers/rdf";
import * as SQL from "@/graphql/resolvers/sql";
import { ResolvedDimension } from "@/graphql/shared-types";
import { getSparqlEditorUrl } from "@/rdf/sparql-utils";

const getSource = (dataSourceType: string) => {
  return dataSourceType === "sparql" ? RDF : SQL;
};

export const Query: QueryResolvers = {
  searchCubes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.searchCubes(parent, args, context, info);
  },
  dataCubeComponents: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeComponents(parent, args, context, info);
  },
  dataCubeMetadata: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeMetadata(parent, args, context, info);
  },
  dataCubeObservations: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeObservations(parent, args, context, info);
  },
  dataCubePreview: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubePreview(parent, args, context, info);
  },
  possibleFilters: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.possibleFilters(parent, args, context, info);
  },
  dataCubeDimensionGeoShapes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeDimensionGeoShapes(parent, args, context, info);
  },
  dataCubeDimensionGeoCoordinates: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeDimensionGeoCoordinates(
      parent,
      args,
      context,
      info
    );
  },
};

const DataCube: DataCubeResolvers = {
  iri: ({ data: { iri } }) => iri,
  title: ({ data: { title } }) => title,
  publicationStatus: ({ data: { publicationStatus } }) => publicationStatus,
  version: ({ data: { version } }) => version ?? null,
  identifier: ({ data: { identifier } }) => identifier ?? null,
  workExamples: ({ data: { workExamples } }) => workExamples ?? null,
  publisher: ({ data: { publisher } }) => publisher ?? null,
  contactName: ({ data: { contactPoint } }) => contactPoint?.name ?? null,
  contactEmail: ({ data: { contactPoint } }) => contactPoint?.email ?? null,
  landingPage: ({ data: { landingPage } }) => landingPage ?? null,
  expires: ({ data: { expires } }) => expires ?? null,
  description: ({ data: { description } }) => description ?? null,
  dateModified: ({ data: { dateModified } }) => dateModified ?? null,
  datePublished: ({ data: { datePublished } }) => datePublished ?? null,
  themes: ({ data: { themes } }) => themes ?? [],
  creator: ({ data: { creator } }) => creator ?? null,
};

export const resolveDimensionType = (
  dataKind: ResolvedDimension["data"]["dataKind"] | undefined,
  scaleType: ScaleType | undefined,
  timeUnit: ResolvedDimension["data"]["timeUnit"] | undefined,
  related: ResolvedDimension["data"]["related"]
): DimensionType => {
  if (related.some((d) => d.type === "StandardError")) {
    return "StandardErrorDimension";
  }

  if (dataKind === "Time") {
    if (scaleType === "Ordinal") {
      if (timeUnit) {
        if (timeUnit === TimeUnit.Month || timeUnit === TimeUnit.Year) {
          return "TemporalEntityDimension";
        } else {
          throw new Error(
            `Unsupported time unit for TemporalEntityDimension: ${timeUnit}`
          );
        }
      }

      return "TemporalOrdinalDimension";
    }

    return "TemporalDimension";
  }

  if (dataKind === "GeoCoordinates") {
    return "GeoCoordinatesDimension";
  }

  if (dataKind === "GeoShape") {
    return "GeoShapesDimension";
  }

  if (scaleType === "Ordinal") {
    return "OrdinalDimension";
  }

  return "NominalDimension";
};

export const resolveMeasureType = (
  scaleType: ScaleType | undefined
): MeasureType => {
  return scaleType === "Ordinal" ? "OrdinalMeasure" : "NumericalMeasure";
};

const mkDimensionResolvers = (_: string): Resolvers["Dimension"] => ({
  __resolveType({ data: { dataKind, scaleType, timeUnit, related } }) {
    return resolveDimensionType(dataKind, scaleType, timeUnit, related);
  },
  iri: ({ data: { iri } }) => iri,
  label: ({ data: { name } }) => name,
  description: ({ data: { description } }) => description || null,
  related: ({ data: { related } }) => related,
  order: ({ data: { order } }) => (order !== undefined ? order : null),
  isNumerical: ({ data: { isNumerical } }) => isNumerical,
  isKeyDimension: ({ data: { isKeyDimension } }) => isKeyDimension,
  unit: ({ data: { unit } }) => unit ?? null,
  scaleType: ({ data: { scaleType } }) => scaleType ?? null,
  values: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dimensionValues(parent, args, context, info);
  },
});

// With an update of apollo-server-micro to 3.0.0, we can no longer use resolvers
// with the same names (in case of JSONObject resolver, the name was always "JSONObject"),
// so we need to make a new resolver for each type.
const makeJSONObjectResolver = (name: string) => {
  return {
    ...GraphQLJSONObject,
    name,
  } as GraphQLScalarType;
};

export const resolvers: Resolvers = {
  Filters: makeJSONObjectResolver("Filters"),
  Observation: makeJSONObjectResolver("Observation"),
  DimensionValue: makeJSONObjectResolver("DimensionValue"),
  RawObservation: makeJSONObjectResolver("RawObservation"),
  Query,
  DataCube,
  ObservationsQuery: {
    data: async ({ data: { observations } }) => observations,
    sparqlEditorUrl: async (
      { data: { query } },
      {},
      {},
      { variableValues }
    ) => {
      return getSparqlEditorUrl({
        query,
        dataSource: {
          type: variableValues.sourceType,
          url: variableValues.sourceUrl,
        },
      });
    },
  },
  Dimension: {
    __resolveType({ data: { dataKind, scaleType, timeUnit, related } }) {
      return resolveDimensionType(dataKind, scaleType, timeUnit, related);
    },
  },
  NominalDimension: {
    ...mkDimensionResolvers("NominalDimension"),
  },
  OrdinalDimension: {
    ...mkDimensionResolvers("OrdinalDimension"),
  },
  TemporalDimension: {
    ...mkDimensionResolvers("TemporalDimension"),
    timeUnit: ({ data: { timeUnit } }) => timeUnit!,
    timeFormat: ({ data }) => {
      if (data.timeFormat === undefined) {
        throw new Error(
          `Time format couldn't be retrieved for ${data.name}. Make sure it's set up properly in the Cube Creator – if it is, make sure that the interval scale is selected for this dimension (or remove time description if it's not a temporal dimension).`
        );
      }

      return data.timeFormat;
    },
  },
  TemporalOrdinalDimension: {
    ...mkDimensionResolvers("TemporalOrdinalDimension"),
  },
  StandardErrorDimension: {
    ...mkDimensionResolvers("StandardErrorDimension"),
  },
  GeoCoordinatesDimension: {
    ...mkDimensionResolvers("GeoCoordinatesDimension"),
  },
  GeoShapesDimension: {
    ...mkDimensionResolvers("GeoShapesDimension"),
  },
  Measure: {
    __resolveType(dimension) {
      return resolveMeasureType(dimension.data.scaleType);
    },
  },
  NumericalMeasure: {
    ...mkDimensionResolvers("NumericalMeasure"),
    isCurrency: ({ data: { isCurrency } }) => isCurrency,
    isDecimal: ({ data: { isDecimal } }) => isDecimal,
    currencyExponent: ({ data: { currencyExponent } }) => currencyExponent || 0,
    resolution: ({ data: { resolution } }) => resolution ?? null,
  },
  OrdinalMeasure: {
    ...mkDimensionResolvers("OrdinalMeasure"),
  },
};
