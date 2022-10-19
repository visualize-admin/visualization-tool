import { Literal, NamedNode } from "rdf-js";

import { DimensionType } from "../charts/chart-config-ui-options";
import {
  DimensionMetadataFragment,
  GeoCoordinatesDimension,
  GeoShapesDimension,
  NominalDimension,
  NumericalMeasure,
  OrdinalDimension,
} from "../graphql/query-hooks";
import { ResolvedDimension } from "../graphql/shared-types";

export type RawObservationValue = Literal | NamedNode;

export type RawObservation = Record<string, RawObservationValue>;

export type ObservationValue = string | number | null;

export type DimensionValue = {
  value: string | number;
  label: string;
  position?: number;
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
  areaLayer?: AreaLayer;
  symbolLayer?: SymbolLayer;
};

const xmlSchema = "http://www.w3.org/2001/XMLSchema#";
const parseRDFLiteral = (value: Literal): ObservationValue => {
  const v = value.value;
  const dt = value.datatype.value.replace(xmlSchema, "");
  switch (dt) {
    case "string":
    case "boolean":
      return v;
    // return v === "true" ? true : false;
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
      return +v;
    // TODO: Figure out how to preserve granularity of date (maybe include interval?)
    // case "date":
    // case "time":
    // case "dateTime":
    // case "gYear":
    // case "gYearMonth":
    //   return new Date(v);
    default:
      return v;
  }
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
export const getTimeDimensions = (dimensions: DimensionMetadataFragment[]) =>
  dimensions.filter((d) => d.__typename === "TemporalDimension");

export const isCategoricalDimension = (
  d: DimensionMetadataFragment
): d is NominalDimension | OrdinalDimension => {
  return isNominalDimension(d) || isOrdinalDimension(d);
};

export const canDimensionBeMultiFiltered = (d: DimensionMetadataFragment) => {
  return (
    isNominalDimension(d) ||
    isOrdinalDimension(d) ||
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

export const getGeoDimensions = (dimensions: DimensionMetadataFragment[]) =>
  dimensions.filter((d) =>
    ["GeoCoordinatesDimension", "GeoShapesDimension"].includes(d.__typename)
  );

export const getDimensionsByDimensionType = ({
  dimensionTypes,
  dimensions,
  measures,
}: {
  dimensionTypes: DimensionType[];
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

export const isGeoCoordinatesDimension = (
  dimension?: DimensionMetadataFragment
): dimension is GeoCoordinatesDimension => {
  return dimension?.__typename === "GeoCoordinatesDimension";
};

export const isGeoShapesDimension = (
  dimension?: DimensionMetadataFragment
): dimension is GeoShapesDimension => {
  return dimension?.__typename === "GeoShapesDimension";
};

export const isNumericalMeasure = (
  dimension?: DimensionMetadataFragment
): dimension is NumericalMeasure => {
  return dimension?.__typename === "NumericalMeasure";
};

export const isStandardErrorResolvedDimension = (dim: ResolvedDimension) => {
  return dim.data?.related.some((x) => x.type === "StandardError");
};

export const isStandardErrorDimension = (dim: DimensionMetadataFragment) => {
  return dim?.related?.some((r) => r.type === "StandardError");
};

export const findRelatedErrorDimension = (
  dimIri: string,
  dimensions: DimensionMetadataFragment[]
) => {
  return dimensions.find((x) =>
    x.related?.some((r) => r.iri === dimIri && r.type === "StandardError")
  );
};

export const shouldValuesBeLoadedForResolvedDimension = (
  dim: ResolvedDimension
) => {
  return !(
    (dim.data.isNumerical && dim.data.scaleType !== "Ordinal") ||
    isStandardErrorResolvedDimension(dim)
  );
};
