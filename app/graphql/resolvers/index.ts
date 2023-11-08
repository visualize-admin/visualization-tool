import { GraphQLScalarType } from "graphql";
import { GraphQLJSONObject } from "graphql-type-json";
import { topology } from "topojson-server";
import { parse as parseWKT } from "wellknown";

import { GeoFeature, GeoProperties, GeoShapes } from "@/domain/data";
import {
  DataCubeResolvers,
  QueryResolvers,
  Resolvers,
} from "@/graphql/resolver-types";
import * as RDF from "@/graphql/resolvers/rdf";
import * as SQL from "@/graphql/resolvers/sql";
import { ResolvedDimension } from "@/graphql/shared-types";
import { RawGeoShape } from "@/rdf/query-geo-shapes";
import { getSparqlEditorUrl } from "@/rdf/sparql-utils";

const getSource = (dataSourceType: string) => {
  return dataSourceType === "sparql" ? RDF : SQL;
};

export const Query: QueryResolvers = {
  searchCubes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.searchCubes(parent, args, context, info);
  },
  dataCubesComponents: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubesComponents(parent, args, context, info);
  },
  dataCubeByIri: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeByIri(parent, args, context, info);
  },
  possibleFilters: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.possibleFilters(parent, args, context, info);
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
  dimensions: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return source.dataCubeDimensions(parent, args, context, info);
  },
  measures: (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return source.dataCubeMeasures(parent, args, context, info);
  },
  dimensionByIri: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return source.dataCubeDimensionByIri(parent, args, context, info);
  },
  observations: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return source.dataCubeObservations(parent, args, context, info);
  },
};

export const resolveComponentType = (component: ResolvedDimension) => {
  const { dataKind, isMeasureDimension, scaleType, related } = component.data;

  if (isMeasureDimension) {
    return "NumericalMeasure";
  }

  if (related.some((d) => d.type === "StandardError")) {
    return "StandardErrorDimension";
  }

  if (dataKind === "Time") {
    return scaleType === "Ordinal"
      ? "TemporalOrdinalDimension"
      : "TemporalDimension";
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

const mkDimensionResolvers = (_: string): Resolvers["Dimension"] => ({
  __resolveType(dimension) {
    return resolveComponentType(dimension);
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
  hierarchy: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.hierarchy(parent, args, context, info);
  },
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
  DataCubeTheme: {
    // Loads theme with dataloader if we need the label
    label: async ({ iri, label }, _, { setup }, info) => {
      if (!label) {
        const { loaders } = await setup(info);
        const resolvedTheme = await loaders.themes.load(iri);
        return resolvedTheme?.label || "";
      }

      return label;
    },
  },
  DataCubeOrganization: {
    label: async ({ iri, label }, _, { setup }, info) => {
      if (!label) {
        const { loaders } = await setup(info);
        const resolvedTheme = await loaders.organizations.load(iri);
        return resolvedTheme?.label || "";
      }

      return label;
    },
  },
  ObservationsQuery: {
    data: async ({ data: { observations } }) => observations,
    rawData: async ({ data: { observationsRaw } }) => observationsRaw,
    sparql: async ({ data: { query } }) =>
      query.replace(/\n+/g, " ").replace(/"/g, "'"),
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
    __resolveType({ data: { related, dataKind, scaleType } }) {
      if (related.some((d) => d.type === "StandardError")) {
        return "StandardErrorDimension";
      }

      if (dataKind === "Time") {
        if (scaleType === "Ordinal") {
          return "TemporalOrdinalDimension";
        } else {
          return "TemporalDimension";
        }
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
    geoCoordinates: async (parent, _, { setup }, info) => {
      const { loaders } = await setup(info);
      return await loaders.geoCoordinates.load(parent);
    },
  },
  GeoShapesDimension: {
    ...mkDimensionResolvers("GeoShapesDimension"),
    geoShapes: async (parent, _, { setup }, info) => {
      const { loaders } = await setup(info);
      const dimValues = await loaders.dimensionValues.load(parent);
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
    __resolveType: ({ data: { scaleType } }) => {
      if (scaleType === "Ordinal") {
        return "OrdinalMeasure";
      } else {
        return "NumericalMeasure";
      }
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
