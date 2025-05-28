import { GraphQLError, GraphQLScalarType, Kind } from "graphql";

import { MeasureType } from "@/configurator";
import { DimensionType } from "@/domain/data";
import { isDataSourceUrlAllowed } from "@/domain/data-source";
import { setupFlamegraph } from "@/gql-flamegraph/resolvers";
import {
  QueryResolvers,
  Resolvers,
  ScaleType,
  TimeUnit,
} from "@/graphql/resolver-types";
import * as RDF from "@/graphql/resolvers/rdf";
import * as SQL from "@/graphql/resolvers/sql";
import { ResolvedDimension } from "@/graphql/shared-types";

const getSource = (dataSourceType: string) => {
  return dataSourceType === "sparql" ? RDF : SQL;
};

export const Query: QueryResolvers = {
  dataCubeLatestIri: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeLatestIri(parent, args, context, info);
  },
  dataCubeUnversionedIri: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeUnversionedIri(parent, args, context, info);
  },
  dataCubeComponents: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeComponents(parent, args, context, info);
  },
  dataCubeMetadata: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeMetadata(parent, args, context, info);
  },
  dataCubeComponentTermsets: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeComponentTermsets(parent, args, context, info);
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
  searchCubes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.searchCubes(parent, args, context, info);
  },
  dataCubeDimensionGeoShapes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeDimensionGeoShapes(parent, args, context, info);
  },
};

export const resolveDimensionType = (
  dataKind: ResolvedDimension["data"]["dataKind"] | undefined,
  scaleType: ScaleType | undefined,
  timeUnit: ResolvedDimension["data"]["timeUnit"] | undefined,
  related: ResolvedDimension["data"]["related"]
): DimensionType => {
  const relatedTypes = Array.from(new Set(related.map((d) => d.type)));

  if (relatedTypes.length > 1) {
    console.warn(
      `WARNING: dimension has more than 1 related type`,
      relatedTypes
    );
  }

  if (related.some((d) => d.type === "StandardError")) {
    return "StandardErrorDimension";
  } else if (related.some((d) => d.type === "ConfidenceUpperBound")) {
    return "ConfidenceUpperBoundDimension";
  } else if (related.some((d) => d.type === "ConfidenceLowerBound")) {
    return "ConfidenceLowerBoundDimension";
  }

  if (dataKind === "Time") {
    if (scaleType === "Ordinal") {
      if (timeUnit) {
        if (timeUnit === TimeUnit.Month || timeUnit === TimeUnit.Year) {
          return "TemporalEntityDimension";
        } else {
          throw Error(
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

export const datasourceUrlValue = (url: string) => {
  if (isDataSourceUrlAllowed(url)) {
    return url;
  }
  throw datasourceValidationError();
};

export const datasourceValidationError = () => {
  return new GraphQLError(
    "BAD_USER_INPUT: Provided value is not an allowed data source"
  );
};

const DataSourceUrlScalar = new GraphQLScalarType({
  name: "DataSourceUrl",
  description: "DataSourceUrl custom scalar type",
  parseValue: datasourceUrlValue,
  serialize: datasourceUrlValue,
  parseLiteral(ast) {
    if (ast.kind === Kind.INT) {
      return datasourceUrlValue(ast.value);
    }

    throw datasourceValidationError();
  },
});

const resolvers: Resolvers = {
  DataSourceUrl: DataSourceUrlScalar,
  Query,
};

setupFlamegraph(resolvers);

export { resolvers };
