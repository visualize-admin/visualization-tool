import {
  CountableTimeInterval,
  timeDay,
  timeHour,
  timeMinute,
  timeMonth,
  timeSecond,
  timeWeek,
  timeYear,
} from "d3-time";
import { timeFormat, timeParse } from "d3-time-format";
import { CubeDimension } from "rdf-cube-view-query";
import { Term } from "rdf-js";

import { truthy } from "@/domain/types";
import { ScaleType, TimeUnit } from "@/graphql/query-hooks";
import { DataCubePublicationStatus } from "@/graphql/resolver-types";
import { ResolvedDataCube, ResolvedDimension } from "@/graphql/shared-types";
import { ExtendedCube } from "@/rdf/extended-cube";
import { timeFormats, timeUnitFormats, timeUnits } from "@/rdf/mappings";
import * as ns from "@/rdf/namespace";
import { hasHierarchy } from "@/rdf/queries";
import { getQueryLocales } from "@/rdf/query-utils";

export const isCubePublished = (cube: ExtendedCube): boolean =>
  cube
    .out(ns.schema.creativeWorkStatus)
    .terms.some((t) =>
      t.equals(ns.adminVocabulary("CreativeWorkStatus/Published"))
    );

export const parseVersionHistory = (cube: ExtendedCube) => {
  return cube.in(ns.schema.hasPart)?.value;
};

export const parseIri = (cube: ExtendedCube) => {
  return cube.term?.value ?? "[NO IRI]";
};

/**
 * Parses a cube coming from rdf-cube-view-query into a simple javascript object
 *
 * @see https://github.com/zazuko/cube-creator/blob/master/apis/core/bootstrap/shapes/dataset.ts for current list of cube metadata
 */
export const parseCube = ({
  cube,
  locale,
}: {
  cube: ExtendedCube;
  locale: string;
}): ResolvedDataCube => {
  const outOpts = { language: getQueryLocales(locale) };
  const creatorIri = cube.out(ns.dcterms.creator).value;
  return {
    cube,
    locale,
    data: {
      iri: parseIri(cube),
      identifier: cube.out(ns.dcterms.identifier)?.value ?? "[NO IDENTIFIER]",
      title: cube.out(ns.schema.name, outOpts)?.value ?? "[NO TITLE]",
      description: cube.out(ns.schema.description, outOpts)?.value ?? "",
      version: cube.out(ns.schema.version)?.value,
      publicationStatus: isCubePublished(cube)
        ? DataCubePublicationStatus.Published
        : DataCubePublicationStatus.Draft,
      datePublished: cube.out(ns.schema.datePublished)?.value,
      dateModified: cube.out(ns.schema.dateModified)?.value,
      themes: cube
        .out(ns.dcat.theme)
        ?.values.filter(truthy)
        .map((t) => ({ iri: t })),
      creator: creatorIri
        ? {
            iri: creatorIri,
          }
        : undefined,
      versionHistory: parseVersionHistory(cube),
      contactPoint: {
        name: cube.out(ns.dcat.contactPoint)?.out(ns.vcard.fn)?.value,
        email: cube.out(ns.dcat.contactPoint)?.out(ns.vcard.hasEmail)?.value,
      },
      publisher: cube.out(ns.dcterms.publisher)?.value,
      landingPage: cube.out(ns.dcat.landingPage)?.value,
      expires: cube.out(ns.schema.expires)?.value,
      workExamples: cube.out(ns.schema.workExample)?.values,
    },
  };
};

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

type RelationType = "StandardError";

const sparqlRelationToVisualizeRelation = {
  "https://cube.link/relation/StandardError": "StandardError",
} as Record<string, RelationType>;

export const parseRelatedDimensions = (dim: CubeDimension) => {
  const relatedDimensionNodes = dim.out(ns.cube`meta/dimensionRelation`);

  const res = relatedDimensionNodes
    .map((n) => {
      const rawType = n.out(ns.rdf("type")).value;
      const type = rawType
        ? sparqlRelationToVisualizeRelation[rawType]
        : undefined;
      const iri = n.out(ns.cube`meta/relatesTo`)?.value;
      if (!iri || !type) {
        return null;
      }

      return {
        type: type,
        iri,
      };
    })
    .filter(truthy);

  return res;
};

export const parseCubeDimension = ({
  dim,
  cube,
  locale,
  units,
}: {
  dim: CubeDimension;
  cube: ExtendedCube;
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

const timeIntervals = new Map<string, CountableTimeInterval>([
  [ns.time.unitYear.value, timeYear],
  [ns.time.unitMonth.value, timeMonth],
  [ns.time.unitWeek.value, timeWeek],
  [ns.time.unitDay.value, timeDay],
  [ns.time.unitHour.value, timeHour],
  [ns.time.unitMinute.value, timeMinute],
  [ns.time.unitSecond.value, timeSecond],
]);

const timeFormatters = new Map<string, (d: Date) => string>([
  [ns.xsd.gYear.value, timeFormat("%Y")],
  [ns.xsd.date.value, timeFormat("%Y-%m-%d")],
  [ns.xsd.dateTime.value, timeFormat("%Y-%m-%dT%H:%M:%S")],
]);

const timeParsers = new Map<string, (d: string) => Date | null>([
  [ns.xsd.gYear.value, timeParse("%Y")],
  [ns.xsd.date.value, timeParse("%Y-%m-%d")],
  [ns.xsd.dateTime.value, timeParse("%Y-%m-%dT%H:%M:%S")],
]);

export const interpolateTimeValues = ({
  dataType,
  timeUnit,
  min,
  max,
}: {
  dataType: string;
  timeUnit: string;
  min: string;
  max: string;
}) => {
  const format = timeFormatters.get(dataType);
  const parse = timeParsers.get(dataType);

  if (!format || !parse) {
    console.warn(`No time parser/formatter found for dataType <${dataType}>`);
    return [];
  }

  const minDate = parse(min);
  const maxDate = parse(max);
  const interval = timeIntervals.get(timeUnit);

  if (!minDate || !maxDate || !interval) {
    console.warn(
      `Couldn't parse dates ${min} or ${max}, or no interval found for timeUnit <${timeUnit}>`
    );

    return [];
  }

  return [...interval.range(minDate, maxDate), maxDate].map(format);
};
