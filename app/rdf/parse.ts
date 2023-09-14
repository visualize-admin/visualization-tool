import {
  CountableTimeInterval,
  timeDay,
  timeFormat,
  timeHour,
  timeMinute,
  timeMonth,
  timeParse,
  timeSecond,
  timeWeek,
  timeYear,
} from "d3";
import { Cube, CubeDimension } from "rdf-cube-view-query";
import { NamedNode, Term } from "rdf-js";

import { truthy } from "@/domain/types";
import { ScaleType } from "@/graphql/query-hooks";

import { DataCubePublicationStatus, TimeUnit } from "../graphql/resolver-types";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";
import { locales } from "../locales/locales";

import * as ns from "./namespace";
import { hasHierarchy } from "./queries";

export const getQueryLocales = (locale: string): string[] => [
  locale,
  ...locales.filter((l) => l !== locale),
  "",
];

export const isCubePublished = (cube: Cube): boolean =>
  cube
    .out(ns.schema.creativeWorkStatus)
    .terms.some((t) =>
      t.equals(ns.adminVocabulary("CreativeWorkStatus/Published"))
    );

export const parseVersionHistory = (cube: Cube) => {
  return cube.in(ns.schema.hasPart)?.value;
};

export const parseIri = (cube: Cube) => {
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
  cube: Cube;
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
      keywords: cube.out(ns.dcat.keyword)?.values,
      workExamples: cube.out(ns.schema.workExample)?.values,
    },
  };
};

const timeUnits = new Map<string, TimeUnit>([
  [ns.time.unitYear.value, TimeUnit.Year],
  [ns.time.unitMonth.value, TimeUnit.Month],
  [ns.time.unitWeek.value, TimeUnit.Week],
  [ns.time.unitDay.value, TimeUnit.Day],
  [ns.time.unitHour.value, TimeUnit.Hour],
  [ns.time.unitMinute.value, TimeUnit.Minute],
  [ns.time.unitSecond.value, TimeUnit.Second],
]);

const timeFormats = new Map<string, string>([
  [ns.xsd.gYear.value, "%Y"],
  [ns.xsd.gYearMonth.value, "%Y-%m"],
  [ns.xsd.date.value, "%Y-%m-%d"],
  [ns.xsd.dateTime.value, "%Y-%m-%dT%H:%M:%S"],
]);

export const getScaleType = (dim: CubeDimension): ScaleType | undefined => {
  const scaleTypeTerm = dim.out(ns.qudt.scaleType).term;

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

const getDataKind = (term: Term | undefined) => {
  return term?.equals(ns.time.GeneralDateTimeDescription)
    ? "Time"
    : term?.equals(ns.schema.GeoCoordinates)
    ? "GeoCoordinates"
    : term?.equals(ns.schema.GeoShape)
    ? "GeoShape"
    : undefined;
};

export const parseDimensionDatatype = (dim: CubeDimension) => {
  const isNamedNode = dim.out(ns.sh.nodeKind).term?.equals(ns.sh.IRI) ?? false;
  let dataType = dim.datatype;
  let hasUndefinedValues = false;

  if (!dataType) {
    // Maybe it has multiple datatypes
    const dataTypes = [
      ...(dim.out(ns.sh.or).list() ?? dim.out(ns.sh.or).toArray()),
    ].flatMap((d) => d.out(ns.sh.datatype).terms) as NamedNode[];

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

  return { isLiteral: !isNamedNode, dataType, hasUndefinedValues };
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
  cube: Cube;
  locale: string;
  units?: Map<
    string,
    { iri: Term; label?: Term; isCurrency?: Term; currencyExponent?: Term }
  >;
}): ResolvedDimension => {
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
  const isNumerical =
    dataType?.equals(ns.xsd.int) ||
    dataType?.equals(ns.xsd.integer) ||
    isDecimal ||
    dataType?.equals(ns.xsd.float) ||
    dataType?.equals(ns.xsd.double) ||
    false;

  const isKeyDimension = dim
    .out(ns.rdf.type)
    .terms.some((t) => t.equals(ns.cube.KeyDimension));

  const isMeasureDimension = dim
    .out(ns.rdf.type)
    .terms.some((t) => t.equals(ns.cube.MeasureDimension));

  const unitTerm = dim.out(ns.qudt.unit).term;
  const unit = unitTerm ? units?.get(unitTerm.value) : undefined;
  const unitLabel = unit?.label?.value;

  const rawOrder = dim.out(ns.sh.order).value;
  const order = rawOrder !== undefined ? parseInt(rawOrder, 10) : undefined;

  const resolution =
    dataType?.equals(ns.xsd.int) || dataType?.equals(ns.xsd.integer)
      ? 0
      : undefined;

  return {
    cube,
    dimension: dim,
    locale,

    data: {
      iri: dim.path?.value!,
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
      order,
      dataKind: getDataKind(dataKindTerm),
      timeUnit: timeUnits.get(timeUnitTerm?.value ?? ""),
      timeFormat: timeFormats.get(dataType?.value ?? ""),
      scaleType: getScaleType(dim),
    },
  };
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
