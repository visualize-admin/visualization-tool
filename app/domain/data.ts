import { Literal, NamedNode, Term } from "rdf-js";

import { ComponentType } from "@/config-types";
import {
  DataCubeOrganization,
  DataCubePublicationStatus,
  DataCubeTheme,
  RelatedDimension,
  ScaleType,
  TimeUnit,
} from "@/graphql/resolver-types";
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

export type HierarchyValue = {
  depth: number;
  dimensionIri: string;
  value: string;
  /** In other words, is selectable? */
  hasValue: Boolean;
  label: string;
  alternateName?: string;
  position?: ObservationValue;
  identifier?: ObservationValue;
  children?: HierarchyValue[];
};

export type Observation = Record<string, ObservationValue>;

export type DataCubesComponents = {
  dimensions: Dimension[];
  measures: Measure[];
};

export type DataCubeMetadata = {
  iri: string;
  identifier?: string;
  title: string;
  description: string;
  version?: string;
  datePublished?: string;
  dateModified?: string;
  publicationStatus: DataCubePublicationStatus;
  themes?: DataCubeTheme[];
  creator?: DataCubeOrganization;
  versionHistory?: string;
  contactPoint?: {
    name?: string;
    email?: string;
  };
  publisher?: string;
  landingPage?: string;
  expires?: string;
  workExamples?: string[];
};

export type Component = Dimension | Measure;

type BasicComponent = {
  cubeIri: string;
  iri: string;
  label: string;
  description?: string;
  unit?: string;
  scaleType?: ScaleType;
  dataType?: string;
  order?: number;
  isNumerical: boolean;
  isKeyDimension: boolean;
  values: DimensionValue[];
  related?: RelatedDimension[];
};

type BasicDimension = BasicComponent & {
  hierarchy?: HierarchyValue[] | null;
};

export type Dimension =
  | NominalDimension
  | OrdinalDimension
  | TemporalDimension
  | TemporalOrdinalDimension
  | GeoCoordinatesDimension
  | GeoShapesDimension
  | StandardErrorDimension;

export type NominalDimension = BasicDimension & {
  __typename: "NominalDimension";
};

export type OrdinalDimension = BasicDimension & {
  __typename: "OrdinalDimension";
};

export type TemporalDimension = BasicDimension & {
  __typename: "TemporalDimension";
  timeUnit: TimeUnit;
  timeFormat: string;
};

export type TemporalOrdinalDimension = BasicDimension & {
  __typename: "TemporalOrdinalDimension";
};

export type GeoCoordinatesDimension = BasicDimension & {
  __typename: "GeoCoordinatesDimension";
};

export type GeoShapesDimension = BasicDimension & {
  __typename: "GeoShapesDimension";
};

export type StandardErrorDimension = BasicDimension & {
  __typename: "StandardErrorDimension";
};

export type Measure = NumericalMeasure | OrdinalMeasure;

type BasicMeasure = BasicComponent & {
  isCurrency?: boolean;
  isDecimal?: boolean;
  currencyExponent?: number;
  resolution?: number;
};

export type NumericalMeasure = BasicMeasure & {
  __typename: "NumericalMeasure";
};

export type OrdinalMeasure = BasicMeasure & {
  __typename: "OrdinalMeasure";
};

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

// Extracted for performance reasons.
export type SearchCube = {
  iri: string;
  title: string;
  description: string | null;
  publicationStatus: DataCubePublicationStatus;
  datePublished: string | null;
  creator: {
    iri: string;
    label: string;
  } | null;
  themes: {
    iri: string;
    label: string;
  }[];
  subthemes: {
    iri: string;
    label: string;
  }[];
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

export const isMeasure = (
  component?: Component | null
): component is Measure => {
  return isNumericalMeasure(component) || isOrdinalMeasure(component);
};

export const isNumericalMeasure = (
  dimension?: Component | null
): dimension is NumericalMeasure => {
  return dimension?.__typename === "NumericalMeasure";
};

export const isOrdinalMeasure = (
  dimension?: Component | null
): dimension is OrdinalMeasure => {
  return dimension?.__typename === "OrdinalMeasure";
};

export const getTemporalDimensions = (dimensions: Component[]) =>
  dimensions.filter((d) => d.__typename === "TemporalDimension");

export const isCategoricalDimension = (
  d: Component
): d is NominalDimension | OrdinalDimension | TemporalOrdinalDimension => {
  return (
    isNominalDimension(d) ||
    isOrdinalDimension(d) ||
    isTemporalOrdinalDimension(d)
  );
};

export const canDimensionBeMultiFiltered = (d: Component) => {
  return (
    isNominalDimension(d) ||
    isOrdinalDimension(d) ||
    isTemporalOrdinalDimension(d) ||
    isGeoCoordinatesDimension(d) ||
    isGeoShapesDimension(d)
  );
};

export const isDimensionSortable = (
  d?: Component
): d is NominalDimension | GeoCoordinatesDimension | GeoShapesDimension => {
  return (
    isNominalDimension(d) ||
    isGeoCoordinatesDimension(d) ||
    isGeoShapesDimension(d)
  );
};

export const getCategoricalDimensions = (dimensions: Component[]) =>
  dimensions.filter(isCategoricalDimension);

export const getGeoDimensions = (dimensions: Component[]) =>
  dimensions.filter(isGeoDimension);

export const getDimensionsByDimensionType = ({
  dimensionTypes,
  dimensions,
  measures,
}: {
  dimensionTypes: ComponentType[];
  dimensions: Component[];
  measures: Component[];
}) =>
  [...measures, ...dimensions].filter((component) =>
    dimensionTypes.includes(component.__typename)
  );

export const isNominalDimension = (
  dimension?: Component | null
): dimension is NominalDimension => {
  return dimension?.__typename === "NominalDimension";
};

export const isOrdinalDimension = (
  dimension?: Component | null
): dimension is OrdinalDimension => {
  return dimension?.__typename === "OrdinalDimension";
};

export const isGeoDimension = (
  dimension?: Component | null
): dimension is GeoCoordinatesDimension | GeoShapesDimension => {
  return (
    isGeoCoordinatesDimension(dimension) || isGeoShapesDimension(dimension)
  );
};

export const isGeoCoordinatesDimension = (
  dimension?: Component | null
): dimension is GeoCoordinatesDimension => {
  return dimension?.__typename === "GeoCoordinatesDimension";
};

export const isGeoShapesDimension = (
  dimension?: Component | null
): dimension is GeoShapesDimension => {
  return dimension?.__typename === "GeoShapesDimension";
};

export const isTemporalDimension = (
  dimension?: Component | null
): dimension is TemporalDimension => {
  return dimension?.__typename === "TemporalDimension";
};

export const isTemporalOrdinalDimension = (
  dimension?: Component | null
): dimension is TemporalOrdinalDimension => {
  return dimension?.__typename === "TemporalOrdinalDimension";
};

export const isStandardErrorResolvedDimension = (dim: ResolvedDimension) => {
  return dim.data?.related.some((x) => x.type === "StandardError");
};

export const isStandardErrorDimension = (
  dim: Component
): dim is StandardErrorDimension => {
  return dim.__typename === "StandardErrorDimension";
};

export const findRelatedErrorDimension = (
  dimIri: string,
  dimensions: Component[]
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
