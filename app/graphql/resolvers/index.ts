import { GraphQLJSONObject } from "graphql-type-json";
import { topology } from "topojson-server";
import { parse as parseWKT } from "wellknown";

import {
  DimensionValue,
  GeoFeature,
  GeoProperties,
  GeoShapes,
} from "@/domain/data";
import {
  DataCubeResolvers,
  QueryResolvers,
  Resolvers,
} from "@/graphql/resolver-types";
import * as RDF from "@/graphql/resolvers/rdf";
import * as SQL from "@/graphql/resolvers/sql";
import { getSparqlEditorUrl } from "@/rdf/queries";
import { RawGeoShape } from "@/rdf/query-geo-shapes";

const getSource = (dataSourceType: string) => {
  return dataSourceType === "sparql" ? RDF : SQL;
};

export const Query: QueryResolvers = {
  dataCubes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubes(parent, args, context, info);
  },
  dataCubeByIri: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.dataCubeByIri(parent, args, context, info);
  },
  possibleFilters: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.possibleFilters(parent, args, context, info);
  },
  themes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.themes(parent, args, context, info);
  },
  subthemes: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.subthemes(parent, args, context, info);
  },
  organizations: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.organizations(parent, args, context, info);
  },
  datasetcount: async (parent, args, context, info) => {
    const source = getSource(args.sourceType);
    return await source.datasetcount(parent, args, context, info);
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
  datePublished: ({ data: { datePublished } }) => datePublished ?? null,
  themes: ({ data: { themes } }) => themes || [],
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

const mkDimensionResolvers = (debugName: string): Resolvers["Dimension"] => ({
  // TODO: how to pass dataSource here? If it's possible, then we also could have
  // different resolvers for RDF and SQL.
  __resolveType({ data: { dataKind, scaleType } }) {
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
  iri: ({ data: { iri } }) => iri,
  label: ({ data: { name } }) => name,
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

export const resolvers: Resolvers = {
  Filters: GraphQLJSONObject,
  Observation: GraphQLJSONObject,
  DimensionValue: GraphQLJSONObject,
  RawObservation: GraphQLJSONObject,
  Query,
  DataCube,
  DataCubeTheme: {
    // Loads theme with dataloader if we need the label
    label: async ({ iri, label }, args, { setup }, info) => {
      if (!label) {
        const { loaders } = await setup(info);
        const resolvedTheme = await loaders.themes.load(iri);
        return resolvedTheme.label;
      }

      return label;
    },
  },
  DataCubeOrganization: {
    label: async ({ iri, label }, args, { setup }, info) => {
      if (!label) {
        const { loaders } = await setup(info);
        const resolvedTheme = await loaders.organizations.load(iri);
        return resolvedTheme.label;
      }

      return label;
    },
  },
  ObservationsQuery: {
    data: async ({ data: { observations } }) => observations,
    rawData: async ({ data: { observationsRaw } }) => observationsRaw,
    sparql: async ({ data: { query } }) =>
      query.replace(/\n+/g, " ").replace(/"/g, "'"),
    sparqlEditorUrl: async ({ data: { query } }) =>
      getSparqlEditorUrl({ query }),
  },
  Dimension: {
    __resolveType({ data: { dataKind, scaleType } }) {
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
    geoCoordinates: async (parent, args, { setup }, info) => {
      const { loaders } = await setup(info);
      return await loaders.geoCoordinates.load(parent);
    },
  },
  GeoShapesDimension: {
    ...mkDimensionResolvers("geoshapes"),
    geoShapes: async (parent, args, { setup }, info) => {
      const { loaders } = await setup(info);
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
