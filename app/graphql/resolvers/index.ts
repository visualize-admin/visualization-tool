import { MeasureType } from "@/configurator";
import { DimensionType } from "@/domain/data";
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
  dataCubeVersionHistory: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeVersionHistory(parent, args, context, info);
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
  if (related.some((d) => d.type === "StandardError")) {
    return "StandardErrorDimension";
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

export const resolvers: Resolvers = {
  Query,
};
