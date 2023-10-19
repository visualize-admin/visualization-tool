import { Literal, NamedNode, Term } from "rdf-js";

import { ComponentType } from "@/config-types";
import {
  DimensionMetadataFragment,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  NominalDimension,
  NumericalMeasure,
  OrdinalDimension,
  OrdinalMeasure,
  TemporalDimension,
  TemporalOrdinalDimension,
} from "@/graphql/query-hooks";
import { ResolvedDimension } from "@/graphql/shared-types";

export type RawObservationValue = Literal | NamedNode;

export type RawObservation = Record<string, RawObservationValue>;

export type ObservationValue = string | number | null;

export type DimensionValue = {
  value: string | number;
  label: string;
  description?: string;
  position?: number;
  color?: string;
  identifier?: string | number;
  alternateName?: string;
};

export type Observation = Record<string, ObservationValue>;

export type GeoProperties = {
  iri: string;
  label: string;
  observation?: Observation;
};

export type GeoShapes = {
  topology: TopoJSON.Topology<TopoJSON.Objects<GeoProperties>>;
};

export type GeoFeature = {
  type: "Feature";
  properties: GeoProperties;
  geometry: GeoJSON.MultiPolygon | GeoJSON.Polygon;
};

export type AreaLayer = {
  shapes: GeoJSON.FeatureCollection<
    GeoJSON.MultiPolygon | GeoJSON.Polygon,
    GeoProperties
  >;
  mesh: GeoJSON.MultiLineString;
};

export type GeoPoint = {
  coordinates: [number, number];
  properties: GeoProperties;
};

export type SymbolLayer = {
  points: GeoPoint[];
};

export type GeoData = {
  areaLayer: AreaLayer | undefined;
  symbolLayer: SymbolLayer | undefined;
};

const xmlSchema = "http://www.w3.org/2001/XMLSchema#";
export const parseRDFLiteral = <T = ObservationValue>(value: Literal): T => {
  const v = value.value;
  const dt = value.datatype.value.replace(xmlSchema, "");
  switch (dt) {
    case "string":
    case "boolean":
      return v as T;
    case "float":
    case "integer":
    case "long":
    case "double":
    case "decimal":
    case "nonPositiveInteger":
    case "nonNegativeInteger":
    case "negativeInteger":
    case "int":
    case "unsignedLong":
    case "positiveInteger":
    case "short":
    case "unsignedInt":
    case "byte":
    case "unsignedShort":
    case "unsignedByte":
      return +v as T;
    default:
      return v as T;
  }
};

export const parseTerm = (term?: Term) => {
  if (!term) {
    return;
  }
  if (term.termType !== "Literal") {
    return term.value;
  }
  return parseRDFLiteral(term);
};

/**
 * Parse observation values (values returnd from query.execute()) to native JS types
 *
 * @param observationValue
 */
export const parseObservationValue = ({
  label,
  value,
}: {
  label?: Literal;
  value: RawObservationValue;
}): ObservationValue => {
  // Prefer the label – if it's not empty (which is currently the case for years)
  if (label && label.value !== "") {
    return label.value;
  }

  // Parse literals to native JS types
  if (value.termType === "Literal") {
    return parseRDFLiteral(value);
  }

  // Return the IRI of named nodes
  return value.value;
};

/**
 * @fixme use metadata to filter time dimension!
 */
export const getTemporalDimensions = (
  dimensions: DimensionMetadataFragment[]
) => dimensions.filter((d) => d.__typename === "TemporalDimension");

export const isCategoricalDimension = (
  d: DimensionMetadataFragment
): d is NominalDimension | OrdinalDimension | TemporalOrdinalDimension => {
  return (
    isNominalDimension(d) ||
    isOrdinalDimension(d) ||
    isTemporalOrdinalDimension(d)
  );
};

export const canDimensionBeMultiFiltered = (d: DimensionMetadataFragment) => {
  return (
    isNominalDimension(d) ||
    isOrdinalDimension(d) ||
    isTemporalOrdinalDimension(d) ||
    isGeoCoordinatesDimension(d) ||
    isGeoShapesDimension(d)
  );
};

export const isDimensionSortable = (
  d?: DimensionMetadataFragment
): d is NominalDimension | GeoCoordinatesDimension | GeoShapesDimension => {
  return (
    isNominalDimension(d) ||
    isGeoCoordinatesDimension(d) ||
    isGeoShapesDimension(d)
  );
};

/**
 * @fixme use metadata to filter categorical dimension!
 */
export const getCategoricalDimensions = (
  dimensions: DimensionMetadataFragment[]
) => dimensions.filter(isCategoricalDimension);

export const getGeoCoordinatesDimensions = (
  dimensions: DimensionMetadataFragment[]
) => dimensions.filter((d) => d.__typename === "GeoCoordinatesDimension");

export const getGeoShapesDimensions = (
  dimensions: DimensionMetadataFragment[]
) => dimensions.filter((d) => d.__typename === "GeoShapesDimension");

export const getGeoDimensions = (dimensions: DimensionMetadataFragment[]) => {
  return dimensions.filter(isGeoDimension);
};

export const getDimensionsByDimensionType = ({
  dimensionTypes,
  dimensions,
  measures,
}: {
  dimensionTypes: ComponentType[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}) =>
  [...measures, ...dimensions].filter((component) =>
    dimensionTypes.includes(component.__typename)
  );

export const isNominalDimension = (
  dimension?: DimensionMetadataFragment
): dimension is NominalDimension => {
  return dimension?.__typename === "NominalDimension";
};

export const isOrdinalDimension = (
  dimension?: DimensionMetadataFragment
): dimension is OrdinalDimension => {
  return dimension?.__typename === "OrdinalDimension";
};

export const isGeoDimension = (
  dimension?: DimensionMetadataFragment
): dimension is GeoCoordinatesDimension | GeoShapesDimension => {
  return (
    isGeoCoordinatesDimension(dimension) || isGeoShapesDimension(dimension)
  );
};

export const isGeoCoordinatesDimension = (
  dimension?: DimensionMetadataFragment | null
): dimension is GeoCoordinatesDimension => {
  return dimension?.__typename === "GeoCoordinatesDimension";
};

export const isGeoShapesDimension = (
  dimension?: DimensionMetadataFragment | null
): dimension is GeoShapesDimension => {
  return dimension?.__typename === "GeoShapesDimension";
};

export const isNumericalMeasure = (
  dimension?: DimensionMetadataFragment | null
): dimension is NumericalMeasure => {
  return dimension?.__typename === "NumericalMeasure";
};

export const isOrdinalMeasure = (
  dimension?: DimensionMetadataFragment | null
): dimension is OrdinalMeasure => {
  return dimension?.__typename === "OrdinalMeasure";
};

export const isTemporalDimension = (
  dimension?: DimensionMetadataFragment | null
): dimension is TemporalDimension => {
  return dimension?.__typename === "TemporalDimension";
};

export const isTemporalOrdinalDimension = (
  dimension?: DimensionMetadataFragment | null
): dimension is TemporalOrdinalDimension => {
  return dimension?.__typename === "TemporalOrdinalDimension";
};

export const isStandardErrorResolvedDimension = (dim: ResolvedDimension) => {
  return dim.data?.related.some((x) => x.type === "StandardError");
};

export const isStandardErrorDimension = (dim: DimensionMetadataFragment) => {
  return dim.__typename === "StandardErrorDimension";
};

export const findRelatedErrorDimension = (
  dimIri: string,
  dimensions: DimensionMetadataFragment[]
) => {
  return dimensions.find((x) =>
    x.related?.some((r) => r.iri === dimIri && r.type === "StandardError")
  );
};

export const shouldLoadMinMaxValues = (dim: ResolvedDimension) => {
  return (
    (dim.data.isNumerical && dim.data.scaleType !== "Ordinal") ||
    isStandardErrorResolvedDimension(dim)
  );
};
