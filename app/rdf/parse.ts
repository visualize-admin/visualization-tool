import { Cube, CubeDimension } from "rdf-cube-view-query";
import { NamedNode } from "rdf-js";
import { DataCubePublicationStatus } from "../graphql/resolver-types";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";
import { locales } from "../locales/locales";
import * as ns from "./namespace";

export const getQueryLocales = (locale: string): string[] => [
  locale,
  ...locales.filter((l) => l !== locale),
  "",
];

export const parseCube = ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}): ResolvedDataCube => {
  const outOpts = { language: getQueryLocales(locale) };

  // See https://github.com/zazuko/cube-creator/blob/master/apis/core/bootstrap/shapes/dataset.ts for current list of cube metadata
  return {
    cube,
    locale,
    data: {
      iri: cube.term?.value ?? "[NO IRI]",
      identifier: cube.out(ns.dcterms.identifier)?.value ?? "[NO IDENTIFIER]",
      title: cube.out(ns.dcterms.title, outOpts)?.value ?? "[NO TITLE]",
      description: cube.out(ns.dcterms.description, outOpts)?.value ?? "",
      version: cube.out(ns.schema.version)?.value,
      publicationStatus:
        ns.adminTerm("CreativeWorkStatus/Published").value ===
        cube.out(ns.schema.creativeWorkStatus)?.value
          ? DataCubePublicationStatus.Published
          : DataCubePublicationStatus.Draft,
      theme: cube.out(ns.dcat.theme)?.value,
      datePublished: cube.out(ns.schema.datePublished)?.value,
      versionHistory: cube.in(ns.schema.hasPart)?.value,
      contactPoint: {
        name: cube.out(ns.dcat.contactPoint)?.out(ns.vcard.fn)?.value,
        email: cube.out(ns.dcat.contactPoint)?.out(ns.vcard.hasEmail)?.value,
      },
      publisher: cube.out(ns.dcterms.publisher)?.value,
      landingPage: cube.out(ns.dcat.landingPage)?.value,
      keywords: cube.out(ns.dcat.keyword)?.values,
    },
  };
};

export const parseCubeDimension = ({
  dim,
  cube,
  locale,
}: {
  dim: CubeDimension;
  cube: Cube;
  locale: string;
}): ResolvedDimension => {
  const outOpts = { language: getQueryLocales(locale) };

  const dataKindTerm = dim.out(ns.cube`meta/dataKind`).out(ns.rdf.type).term;
  const scaleTypeTerm = dim.out(ns.qudt.scaleType).term;

  let dataType = dim.datatype;
  let hasUndefinedValues = false;

  if (!dataType) {
    // Maybe it has multiple datatypes
    const dataTypes = [
      ...(dim.out(ns.sh.or).list() ?? dim.out(ns.sh.or).toArray()),
    ].flatMap((item) => {
      return item.out(ns.sh.datatype).terms;
    }) as NamedNode[];

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

  const isLiteral = dataType ? true : false;

  const isNumerical =
    dataType?.equals(ns.xsd.int) ||
    dataType?.equals(ns.xsd.integer) ||
    dataType?.equals(ns.xsd.decimal) ||
    false;

  return {
    cube,
    dimension: dim,
    locale,

    data: {
      iri: dim.path?.value!,
      isLiteral,
      isNumerical,
      hasUndefinedValues,
      dataType: dataType?.value,
      name: dim.out(ns.schema.name, outOpts).value ?? dim.path?.value!,
      dataKind: dataKindTerm?.equals(ns.time.GeneralDateTimeDescription)
        ? "Time"
        : dataKindTerm?.equals(ns.schema.GeoCoordinates)
        ? "GeoCoordinates"
        : dataKindTerm?.equals(ns.schema.GeoShape)
        ? "GeoShape"
        : undefined,
      scaleType: scaleTypeTerm?.equals(ns.qudt.NominalScale)
        ? "Nominal"
        : scaleTypeTerm?.equals(ns.qudt.OrdinalScale)
        ? "Ordinal"
        : scaleTypeTerm?.equals(ns.qudt.RatioScale)
        ? "Ratio"
        : scaleTypeTerm?.equals(ns.qudt.IntervalScale)
        ? "Interval"
        : undefined,
      unit: dim.out(ns.qudt.unit).value,
    },
  };
};
