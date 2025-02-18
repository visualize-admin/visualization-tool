import { CubeDimension } from "rdf-cube-view-query";
import { Term } from "rdf-js";

import { truthy } from "@/domain/types";
import {
  RelatedDimensionType,
  ScaleType,
  TimeUnit,
} from "@/graphql/query-hooks";
import { ResolvedDimension } from "@/graphql/shared-types";
import { ExtendedCube } from "@/rdf/extended-cube";
import { getDimensionLimits } from "@/rdf/limits";
import { timeFormats, timeUnitFormats, timeUnits } from "@/rdf/mappings";
import * as ns from "@/rdf/namespace";
import { hasHierarchy } from "@/rdf/queries";
import { getQueryLocales } from "@/rdf/query-utils";

export const getScaleType = (
  scaleTypeTerm: Term | undefined
): ScaleType | undefined => {
  return scaleTypeTerm?.equals(ns.qudt.NominalScale)
    ? ScaleType.Nominal
    : scaleTypeTerm?.equals(ns.qudt.OrdinalScale)
      ? ScaleType.Ordinal
      : scaleTypeTerm?.equals(ns.qudt.RatioScale)
        ? ScaleType.Ratio
        : scaleTypeTerm?.equals(ns.qudt.IntervalScale)
          ? ScaleType.Interval
          : undefined;
};

export const getDataKind = (term: Term | undefined) => {
  return term?.equals(ns.time.GeneralDateTimeDescription)
    ? "Time"
    : term?.equals(ns.schema.GeoCoordinates)
      ? "GeoCoordinates"
      : term?.equals(ns.schema.GeoShape)
        ? "GeoShape"
        : undefined;
};

export const parseDimensionDatatype = (dim: CubeDimension) => {
  const isLiteral =
    dim.out(ns.sh.nodeKind).term?.equals(ns.sh.Literal) ?? false;
  let dataType = dim.datatype ?? dim.out(ns.sh.datatype).terms?.[0];
  let hasUndefinedValues = false;

  if (!dataType) {
    // Maybe it has multiple datatypes
    const dataTypes = [
      ...(dim.out(ns.sh.or).list() ?? dim.out(ns.sh.or).toArray()),
    ].flatMap((d) => d.out(ns.sh.datatype).terms);

    hasUndefinedValues = dataTypes.some((d) => ns.cube.Undefined.equals(d));

    const definedDataTypes = dataTypes.filter(
      (d) => !ns.cube.Undefined.equals(d)
    );

    if (definedDataTypes.length > 1) {
      console.warn(
        `WARNING: dimension <${dim.path?.value}> has more than 1 non-undefined datatype`,
        definedDataTypes
      );
    }

    if (definedDataTypes.length > 0) {
      dataType = definedDataTypes[0];
    }
  }

  return { isLiteral, dataType, hasUndefinedValues };
};

const sparqlRelationToVisualizeRelation = {
  "https://cube.link/relation/StandardError": "StandardError",
  "https://cube.link/relation/ConfidenceUpperBound": "ConfidenceUpperBound",
  "https://cube.link/relation/ConfidenceLowerBound": "ConfidenceLowerBound",
} as Record<string, RelatedDimensionType>;

export const parseRelatedDimensions = (dim: CubeDimension) => {
  const relatedDimensionNodes = dim.out(ns.cube`meta/dimensionRelation`);

  return relatedDimensionNodes
    .map((n) => {
      const rawType = n.out(ns.rdf("type")).value;
      const type = rawType
        ? sparqlRelationToVisualizeRelation[rawType]
        : undefined;
      const iri = n.out(ns.cube`meta/relatesTo`)?.value;

      if (!iri || !type) {
        return null;
      }

      return { type, iri };
    })
    .filter(truthy);
};

export const parseCubeDimension = ({
  dim,
  cube,
  unversionedCubeIri,
  locale,
  units,
}: {
  dim: CubeDimension;
  cube: ExtendedCube;
  unversionedCubeIri: string;
  locale: string;
  units?: Map<
    string,
    { iri: Term; label?: Term; isCurrency?: Term; currencyExponent?: Term }
  >;
}): ResolvedDimension => {
  const iri = dim.path?.value!;
  const outOpts = { language: getQueryLocales(locale) };
  const name = dim.out(ns.schema.name, outOpts).value ?? dim.path?.value!;
  const description = dim.out(ns.schema.description, outOpts).value;

  const dataKindTerm = dim.out(ns.cube`meta/dataKind`).out(ns.rdf.type).term;
  const related = parseRelatedDimensions(dim);

  const timeUnitTerm = dim
    .out(ns.cube`meta/dataKind`)
    .out(ns.time.unitType).term;

  const { isLiteral, dataType, hasUndefinedValues } =
    parseDimensionDatatype(dim);

  const isDecimal = dataType?.equals(ns.xsd.decimal) ?? false;
  const isNumerical = getIsNumerical(dataType);
  const isKeyDimension = dim
    .out(ns.rdf.type)
    .terms.some((t) => t.equals(ns.cube.KeyDimension));
  const isMeasureDimension = dim
    .out(ns.rdf.type)
    .terms.some((t) => t.equals(ns.cube.MeasureDimension));

  // Keeping qudt:unit format for backwards compatibility.
  const unitTerm = dim.out(ns.qudt.unit).term ?? dim.out(ns.qudt.hasUnit).term;
  const unit = unitTerm ? units?.get(unitTerm.value) : undefined;
  const unitLabel = unit?.label?.value;
  const resolution = parseResolution(dataType);
  const timeUnit = getTimeUnit(timeUnitTerm);
  const timeFormat = getTimeFormat(dataType, timeUnit);

  return {
    cube,
    dimension: dim,
    locale,
    data: {
      iri,
      name,
      description,
      related,
      isDecimal,
      isLiteral,
      isNumerical,
      isKeyDimension,
      isMeasureDimension,
      hasUndefinedValues,
      hasHierarchy: hasHierarchy(dim),
      unit: unitLabel,
      dataType: dataType?.value,
      resolution,
      isCurrency: !!unit?.isCurrency?.value,
      currencyExponent: unit?.currencyExponent?.value
        ? parseInt(unit.currencyExponent.value)
        : undefined,
      order: parseNumericalTerm(dim.out(ns.sh.order).term),
      dataKind: getDataKind(dataKindTerm),
      timeUnit,
      timeFormat,
      scaleType: getScaleType(dim.out(ns.qudt.scaleType).term),
      limits: getDimensionLimits(dim, { locale, unversionedCubeIri }),
    },
  };
};

export const parseNumericalTerm = (term: Term | undefined) => {
  return term !== undefined ? parseInt(term.value, 10) : undefined;
};

export const getTimeUnit = (timeUnitTerm: Term | undefined) => {
  return timeUnits.get(timeUnitTerm?.value ?? "");
};

export const getTimeFormat = (
  dataTypeTerm: Term | undefined,
  timeUnit: TimeUnit | undefined
) => {
  return (
    timeFormats.get(dataTypeTerm?.value ?? "") ??
    (timeUnit ? timeUnitFormats.get(timeUnit) : undefined)
  );
};

export const parseResolution = (dataTypeTerm: Term | undefined) => {
  return dataTypeTerm?.equals(ns.xsd.int) ||
    dataTypeTerm?.equals(ns.xsd.integer)
    ? 0
    : undefined;
};

export const getIsNumerical = (dataTypeTerm: Term | undefined) => {
  return (
    dataTypeTerm?.equals(ns.xsd.int) ||
    dataTypeTerm?.equals(ns.xsd.integer) ||
    dataTypeTerm?.equals(ns.xsd.float) ||
    dataTypeTerm?.equals(ns.xsd.double) ||
    dataTypeTerm?.equals(ns.xsd.decimal) ||
    false
  );
};
