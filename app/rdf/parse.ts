import { Cube, CubeDimension } from "rdf-cube-view-query";
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
      publicationStatus:
        ns.adminTerm("CreativeWorkStatus/Published").value ===
        cube.out(ns.schema.creativeWorkStatus)?.value
          ? DataCubePublicationStatus.Published
          : DataCubePublicationStatus.Draft,
      theme: cube.out(ns.dcat.theme)?.value,
      datePublished: cube.out(ns.schema.datePublished)?.value,
      versionHistory: cube.in(ns.schema.hasPart)?.value,
      contactPoint: cube.out(ns.dcat.contactPoint)?.out(ns.vcard.fn)?.value,
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

  const isLiteral = dim.datatype ? true : false;
  const isNumerical =
    dim.datatype?.equals(ns.xsd.int) ||
    dim.datatype?.equals(ns.xsd.integer) ||
    dim.datatype?.equals(ns.xsd.decimal);
  const dataKindTerm = dim.out(ns.cube`meta/dataKind`).out(ns.rdf.type).term;
  const scaleTypeTerm = dim.out(ns.qudt.scaleType).term;

  return {
    cube,
    dimension: dim,
    locale,

    data: {
      iri: dim.path?.value!,
      isLiteral,
      isNumerical,
      dataType: dim.datatype?.value,
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
