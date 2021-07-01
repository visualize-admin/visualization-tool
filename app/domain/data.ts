import { Literal, NamedNode } from "rdf-js";
import { DimensionMetaDataFragment } from "../graphql/query-hooks";
import { DimensionType } from "../charts/chart-config-ui-options";

export type RawObservationValue = Literal | NamedNode;

export type RawObservation = Record<string, RawObservationValue>;

export type ObservationValue = string | number | null;

export type DimensionValue = { value: string | number; label: string };

export type Observation = Record<string, ObservationValue>;

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
export const getTimeDimensions = (dimensions: DimensionMetaDataFragment[]) =>
  dimensions.filter((d) => d.__typename === "TemporalDimension");
/**
 * @fixme use metadata to filter categorical dimension!
 */
export const getCategoricalDimensions = (
  dimensions: DimensionMetaDataFragment[]
) =>
  dimensions.filter(
    (d) =>
      d.__typename === "NominalDimension" || d.__typename === "OrdinalDimension"
  );

export const getDimensionsByDimensionType = ({
  dimensionTypes,
  dimensions,
  measures,
}: {
  dimensionTypes: DimensionType[];
  dimensions: DimensionMetaDataFragment[];
  measures: DimensionMetaDataFragment[];
}) =>
  [...measures, ...dimensions].filter((component) =>
    dimensionTypes.includes(component.__typename)
  );
