import { Attribute, Dimension, Measure } from "@zazuko/query-rdf-data-cube";
import { Literal, NamedNode } from "rdf-js";

export interface DimensionWithMeta {
  component: Dimension;
  values: {
    label: Literal;
    value: NamedNode | Literal;
  }[];
}
export interface AttributeWithMeta {
  component: Attribute;
  values: {
    label: Literal;
    value: NamedNode | Literal;
  }[];
}
export interface MeasureWithMeta {
  component: Measure;
  min: Literal | null;
  max: Literal | null;
}

export type ComponentWithMeta =
  | DimensionWithMeta
  | AttributeWithMeta
  | MeasureWithMeta;

export type RawObservationValue = {
  value: Literal | NamedNode;
  label?: Literal;
};

export type RawObservation = Record<string, RawObservationValue>;

export type ObservationValue = string | number | boolean | Date;

export type Observation = Record<string, ObservationValue>;

const xmlSchema = "http://www.w3.org/2001/XMLSchema#";
const parseRDFLiteral = (value: Literal): ObservationValue => {
  const v = value.value;
  const dt = value.datatype.value.replace(xmlSchema, "");
  switch (dt) {
    case "string":
      return v;
    case "boolean":
      return v === "true" ? true : false;
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
  value
}: RawObservationValue): ObservationValue => {
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

export const parseObservations = (
  observations: RawObservation[]
): Observation[] =>
  observations.map(d => {
    let parsedOperation: Observation = {};
    for (const [k, v] of Object.entries(d)) {
      parsedOperation[k] = parseObservationValue(v);
    }
    return parsedOperation;
  });

export const isTimeDimension = ({ component }: DimensionWithMeta) => {
  const scaleOfMeasure = component.extraMetadata.scaleOfMeasure;

  if (scaleOfMeasure) {
    return /cube\/scale\/Temporal\/?$/.test(scaleOfMeasure.value);
  }

  // FIXME: Remove this once we're sure that scaleOfMeasure always works
  return /(Jahr|Année|Anno|Year|Zeit|Time|Temps|Tempo)/i.test(component.label.value);
};

export const getDataTypeFromDimensionValues = ({
  component,
  values
}: DimensionWithMeta): NamedNode | undefined => {
  if (values[0] && values[0].value.termType === "Literal") {
    return values[0].value.datatype;
  }

  return undefined;
};

export const isCategoricalDimension = ({
  component,
  values
}: DimensionWithMeta) => {
  const scaleOfMeasure = component.extraMetadata.scaleOfMeasure;

  if (scaleOfMeasure) {
    return /cube\/scale\/Nominal\/?$/.test(scaleOfMeasure.value);
  }

  // FIXME: Don't just assume all non-time dimensions are categorical
  return !isTimeDimension({ component, values });
};

/**
 * @fixme use metadata to filter time dimension!
 */
export const getTimeDimensions = (dimensions: DimensionWithMeta[]) =>
  dimensions.filter(isTimeDimension);
/**
 * @fixme use metadata to filter categorical dimension!
 */
export const getCategoricalDimensions = (dimensions: DimensionWithMeta[]) =>
  dimensions.filter(isCategoricalDimension);

export const getComponentIri = ({ component }: ComponentWithMeta): string => {
  return component.iri.value;
};
export const getDimensionLabel = ({ component }: ComponentWithMeta): string => {
  return component.label.value;
};

// Measure
export const getMeasureLabel = ({ component }: MeasureWithMeta): string => {
  return component.label.value;
};
