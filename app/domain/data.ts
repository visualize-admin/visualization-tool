import { Literal, Term } from "rdf-js";

import { ComponentType } from "@/config-types";
import { ComponentId } from "@/graphql/make-component-id";
import {
  DataCubeOrganization,
  DataCubePublicationStatus,
  DataCubeTheme,
  RelatedDimension,
  ScaleType,
  TimeUnit,
} from "@/graphql/resolver-types";
// @ts-ignore
import { ResolvedDimension } from "@/graphql/shared-types";
import { Limit } from "@/rdf/limits";

type RawObservationValue = Term;

export type RawObservation = Record<string, RawObservationValue>;

export type ObservationValue = string | number | null;

export type DimensionValue = {
  value: string | number;
  label: string;
  description?: string;
  /** String in case of {@link TemporalEntityDimension}. */
  position?: number | string;
  color?: string;
  identifier?: string | number;
  alternateName?: string;
  geometry?: string;
  latitude?: number;
  longitude?: number;
};

export type HierarchyValue = {
  depth: number;
  dimensionId: string;
  value: string;
  /** In other words, is selectable? */
  hasValue: boolean;
  label: string;
  alternateName?: string;
  position?: ObservationValue;
  identifier?: ObservationValue;
  children?: HierarchyValue[];
};

export type DataCubeComponents = {
  dimensions: Dimension[];
  measures: Measure[];
};

export type DataCubeMetadata = {
  iri: string;
  unversionedIri?: string;
  identifier?: string;
  title: string;
  description: string;
  version?: string;
  datePublished?: string;
  dateModified?: string;
  publicationStatus: DataCubePublicationStatus;
  themes?: DataCubeTheme[];
  creator?: DataCubeOrganization;
  contactPoint?: {
    name?: string;
    email?: string;
  };
  publisher?: string;
  landingPage?: string;
  expires?: string;
  workExamples?: string[];
};

// String in case of joinBy dimensions.
// TODO: we could also use a branded type here.
export type Observation = Record<ComponentId | string, ObservationValue>;

export type DataCubeObservations = {
  data: Observation[];
  sparqlEditorUrl: string;
};

export type DataCubesObservations = {
  data: Observation[];
  sparqlEditorUrls: {
    cubeIri: string;
    url: string;
  }[];
};

export type DataCubePreview = {
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[];
};

export type Termset = {
  iri: string;
  label: string;
  __typename: "Termset";
};

export type ComponentTermsets = {
  iri: string;
  label: string;
  termsets: Termset[];
};

type ComponentRenderingConfig = {
  enableAnimation: boolean;
  enableCustomSort: boolean;
  enableMultiFilter: boolean;
  enableSegment: boolean;
};

const ComponentsRenderingConfig: {
  [type in ComponentType]: ComponentRenderingConfig;
} = {
  NominalDimension: {
    enableAnimation: false,
    enableCustomSort: true,
    enableMultiFilter: true,
    enableSegment: true,
  },
  OrdinalDimension: {
    enableAnimation: false,
    enableCustomSort: false,
    enableMultiFilter: true,
    enableSegment: true,
  },
  TemporalDimension: {
    enableAnimation: true,
    enableCustomSort: false,
    enableMultiFilter: false,
    enableSegment: true,
  },
  TemporalEntityDimension: {
    enableAnimation: true,
    enableCustomSort: false,
    // FIXME: should behave like TemporalDimension
    enableMultiFilter: true,
    enableSegment: true,
  },
  TemporalOrdinalDimension: {
    enableAnimation: true,
    enableCustomSort: false,
    enableMultiFilter: true,
    enableSegment: true,
  },
  GeoCoordinatesDimension: {
    enableAnimation: false,
    enableCustomSort: true,
    enableMultiFilter: true,
    enableSegment: true,
  },
  GeoShapesDimension: {
    enableAnimation: false,
    enableCustomSort: true,
    enableMultiFilter: true,
    enableSegment: true,
  },
  NumericalMeasure: {
    enableAnimation: false,
    enableCustomSort: false,
    enableMultiFilter: false,
    enableSegment: false,
  },
  OrdinalMeasure: {
    enableAnimation: false,
    enableCustomSort: false,
    enableMultiFilter: false,
    enableSegment: false,
  },
  StandardErrorDimension: {
    enableAnimation: false,
    enableCustomSort: false,
    enableMultiFilter: false,
    enableSegment: false,
  },
  ConfidenceUpperBoundDimension: {
    enableAnimation: false,
    enableCustomSort: false,
    enableMultiFilter: false,
    enableSegment: false,
  },
  ConfidenceLowerBoundDimension: {
    enableAnimation: false,
    enableCustomSort: false,
    enableMultiFilter: false,
    enableSegment: false,
  },
};

export const ANIMATION_ENABLED_COMPONENTS = Object.entries(
  ComponentsRenderingConfig
)
  .filter(([, config]) => config.enableAnimation)
  .map(([type]) => type as ComponentType);

export const CUSTOM_SORT_ENABLED_COMPONENTS = Object.entries(
  ComponentsRenderingConfig
)
  .filter(([, config]) => config.enableCustomSort)
  .map(([type]) => type as ComponentType);

export const MULTI_FILTER_ENABLED_COMPONENTS = Object.entries(
  ComponentsRenderingConfig
)
  .filter(([, config]) => config.enableMultiFilter)
  .map(([type]) => type as ComponentType);

export const SEGMENT_ENABLED_COMPONENTS = Object.entries(
  ComponentsRenderingConfig
)
  .filter(([, config]) => config.enableSegment)
  .map(([type]) => type as ComponentType);

export type Component = Dimension | Measure;

export type BaseComponent = {
  cubeIri: string;
  id: ComponentId;
  label: string;
  description?: string;
  unit?: string;
  scaleType?: ScaleType;
  dataType?: string;
  order?: number;
  isNumerical: boolean;
  isKeyDimension: boolean;
  values: DimensionValue[];
  relatedLimitValues: Pick<
    Limit["related"][number],
    "value" | "label" | "position"
  >[];
  related?: RelatedDimension[];
};

export type BaseDimension = Omit<BaseComponent, "id"> & {
  hierarchy?: HierarchyValue[] | null;
} & (
    | {
        id: string;
        isJoinByDimension: true;
        originalIds: {
          cubeIri: string;
          dimensionId: ComponentId;
          label: string;
          description: string;
        }[];
      }
    | {
        id: ComponentId;
        isJoinByDimension?: never;
        originalIds?: never;
      }
  );

export type JoinByComponent = Extract<Component, { isJoinByDimension: true }>;

export const isJoinByComponent = (d: Component): d is JoinByComponent => {
  return !!(
    "isJoinByDimension" in d &&
    d.isJoinByDimension &&
    "originalIds" in d
  );
};

export type Dimension =
  | NominalDimension
  | OrdinalDimension
  | TemporalDimension
  | TemporalEntityDimension
  | TemporalOrdinalDimension
  | GeoCoordinatesDimension
  | GeoShapesDimension
  | StandardErrorDimension
  | ConfidenceUpperBoundDimension
  | ConfidenceLowerBoundDimension;

export type DimensionType = Dimension["__typename"];

export type NominalDimension = BaseDimension & {
  __typename: "NominalDimension";
};

type OrdinalDimension = BaseDimension & {
  __typename: "OrdinalDimension";
};

export type TemporalDimension = BaseDimension & {
  __typename: "TemporalDimension";
  timeUnit: TimeUnit;
  timeFormat: string;
};

export type TemporalEntityDimension = BaseDimension & {
  __typename: "TemporalEntityDimension";
  timeUnit: TimeUnit;
  timeFormat: string;
};

// TODO
/** Currently, the formatted date for month- and year-based temporal entities
 * is stored in the `position` field. This will be changed in the future, once
 * there will be datasets with other temporal entity types.
 *
 * Also see Zulip conversation about having a unified way of accessing formatted
 * temporal entity values.
 *
 * https://zulip.zazuko.com/#narrow/stream/40-bafu-ext/topic/temporal.20entity.20and.20schema.3AsameAs
 * @see {resolveDimensionType}
 */
export const getTemporalEntityValue = (value: DimensionValue) => {
  return value.position ?? value.value;
};

type TemporalOrdinalDimension = BaseDimension & {
  __typename: "TemporalOrdinalDimension";
};

export type GeoCoordinatesDimension = BaseDimension & {
  __typename: "GeoCoordinatesDimension";
};

export type GeoShapesDimension = BaseDimension & {
  __typename: "GeoShapesDimension";
};

type StandardErrorDimension = BaseDimension & {
  __typename: "StandardErrorDimension";
};

type ConfidenceUpperBoundDimension = BaseDimension & {
  __typename: "ConfidenceUpperBoundDimension";
};

type ConfidenceLowerBoundDimension = BaseDimension & {
  __typename: "ConfidenceLowerBoundDimension";
};

export type Measure = NumericalMeasure | OrdinalMeasure;

type BaseMeasure = BaseComponent & {
  isCurrency?: boolean;
  isDecimal?: boolean;
  currencyExponent?: number;
  resolution?: number;
  limits: Limit[];
};

export type NumericalMeasure = BaseMeasure & {
  __typename: "NumericalMeasure";
};

type OrdinalMeasure = BaseMeasure & {
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

type GeoCoordinate = {
  iri: string;
  label: string;
  latitude: number;
  longitude: number;
};

export const dimensionValuesToGeoCoordinates = (
  values: DimensionValue[]
): GeoCoordinates => {
  return values
    .filter((d) => d.latitude && d.longitude)
    .map((d) => ({
      iri: d.value as string,
      label: d.label,
      latitude: d.latitude!,
      longitude: d.longitude!,
    }));
};

export type GeoCoordinates = GeoCoordinate[];

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
  unversionedIri: string;
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
  termsets: {
    iri: string;
    label: string;
  }[];
  dimensions?: {
    id: ComponentId;
    label: string;
    timeUnit?: string;
    termsets: {
      iri: string;
      label: string;
    }[];
  }[];
};

const xmlSchema = "http://www.w3.org/2001/XMLSchema#";
const parseRDFLiteral = <T = ObservationValue>(value: Literal): T => {
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
 * Parse observation values (values returned from query.execute()) to native JS types
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

export const isDimension = (
  component?: Component | null
): component is Dimension => {
  return !isMeasure(component);
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

const isCategoricalDimension = (
  d: Component
): d is NominalDimension | OrdinalDimension | TemporalOrdinalDimension => {
  return (
    isNominalDimension(d) ||
    isOrdinalDimension(d) ||
    isTemporalOrdinalDimension(d)
  );
};

export const getCategoricalDimensions = (dimensions: Component[]) =>
  dimensions.filter(isCategoricalDimension);

export const getGeoDimensions = (dimensions: Component[]) =>
  dimensions.filter(isGeoDimension);

export const getComponentsFilteredByType = ({
  dimensionTypes,
  dimensions,
  measures,
}: {
  dimensionTypes: ComponentType[];
  dimensions: Component[];
  measures: Component[];
}) => {
  return [...measures, ...dimensions].filter((c) =>
    dimensionTypes.includes(c.__typename)
  );
};

const isNominalDimension = (
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

export const isTemporalEntityDimension = (
  dimension?: Component | null
): dimension is TemporalEntityDimension => {
  return dimension?.__typename === "TemporalEntityDimension";
};

export const canDimensionBeTimeFiltered = (
  dimension?: Component | null
): dimension is TemporalDimension | TemporalEntityDimension => {
  return isTemporalDimension(dimension) || isTemporalEntityDimension(dimension);
};

export const isTemporalOrdinalDimension = (
  dimension?: Component | null
): dimension is TemporalOrdinalDimension => {
  return dimension?.__typename === "TemporalOrdinalDimension";
};

export const isTemporalDimensionWithTimeUnit = (
  dimension?: Component | null
): dimension is Extract<Dimension, { timeUnit: any }> => {
  return !!dimension && "timeUnit" in dimension;
};

const isStandardErrorResolvedDimension = (dim: ResolvedDimension) => {
  return dim.data?.related.some((r) => r.type === "StandardError");
};

const isConfidenceLowerBoundResolvedDimension = (dim: ResolvedDimension) => {
  return dim.data?.related.some((r) => r.type === "ConfidenceLowerBound");
};

const isConfidenceUpperBoundResolvedDimension = (dim: ResolvedDimension) => {
  return dim.data?.related.some((r) => r.type === "ConfidenceUpperBound");
};

export const isStandardErrorDimension = (
  dim: Component
): dim is StandardErrorDimension => {
  return dim.__typename === "StandardErrorDimension";
};

export const isConfidenceUpperBoundDimension = (
  dim: Component
): dim is ConfidenceUpperBoundDimension => {
  return dim.__typename === "ConfidenceUpperBoundDimension";
};

export const isConfidenceLowerBoundDimension = (
  dim: Component
): dim is ConfidenceLowerBoundDimension => {
  return dim.__typename === "ConfidenceLowerBoundDimension";
};

export const shouldLoadMinMaxValues = (dim: ResolvedDimension) => {
  const {
    data: { isNumerical, scaleType, dataKind },
  } = dim;

  return (
    (isNumerical && scaleType !== "Ordinal" && dataKind !== "Time") ||
    isStandardErrorResolvedDimension(dim) ||
    isConfidenceUpperBoundResolvedDimension(dim) ||
    isConfidenceLowerBoundResolvedDimension(dim)
  );
};
