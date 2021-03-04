import namespace from "@rdfjs/namespace";
import {
  Cube,
  CubeDimension,
  LookupSource,
  Source,
  View,
} from "rdf-cube-view-query";
import rdf from "rdf-ext";
import { Literal, NamedNode } from "rdf-js";
import { SPARQL_ENDPOINT } from "../domain/env";
import { locales } from "../locales/locales";
import ParsingClient from "sparql-http-client/ParsingClient";
import { dcterms, dcat, schema, vcard } from "@tpluscode/rdf-ns-builders";
import * as z from "zod";

const ns = {
  classifications: namespace("http://classifications.data.admin.ch/"),
  schemaAdmin: namespace("https://schema.ld.admin.ch/"),
  adminTerm: namespace("https://ld.admin.ch/definedTerm"),
};

const getQueryLocales = (locale: string): string[] => [
  locale,
  ...locales.filter((l) => l !== locale),
  "*",
];

const client = new ParsingClient({
  endpointUrl: SPARQL_ENDPOINT,
});

const cubeSchema = z.object({
  iri: z.string().url(),
  identifier: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  publisher: z.string().optional(),
  theme: z.string().optional(),
  status: z.enum(["Draft", "Published"]).optional(),
  versionHistory: z.string().optional(),
});

const cubesSchema = z.array(cubeSchema);

const createSource = () =>
  new Source({
    sourceGraph: "https://lindas.admin.ch/foen/cube",
    endpointUrl: SPARQL_ENDPOINT,
    // user: '',
    // password: ''
  });

export const getCubes = async ({
  includeDrafts = true,
  locale,
}: {
  includeDrafts?: boolean;
  locale: string;
}) => {
  const source = createSource();

  const _cubes = await source.cubes({
    filters: [
      // Deprecated cubes have a schema.org/validThrough property; Only show cubes that don't have it
      Cube.filter.noValidThrough(),
    ].concat(
      includeDrafts
        ? []
        : Cube.filter.status(ns.adminTerm("CreativeWorkStatus/Published"))
    ),
  });

  const outOpts = { language: getQueryLocales(locale) };

  // See https://github.com/zazuko/cube-creator/blob/master/apis/core/bootstrap/shapes/dataset.ts for current list of cube metadata
  const cubes = _cubes.map((c) => {
    return {
      iri: c.term?.value,
      identifier: c.out(dcterms.identifier)?.value,
      title: c.out(dcterms.title, outOpts)?.value,
      description: c.out(dcterms.description, outOpts)?.value,
      status: c.out(schema.creativeWorkStatus)?.value,
      theme: c.out(dcat.theme)?.value,
      versionHistory: c.in(schema.hasPart)?.value,
      contactPoint: c.out(dcat.contactPoint)?.out(vcard.fn)?.value,
      landingPage: c.out(dcat.landingPage)?.value,
      keywords: c.out(dcat.keyword)?.values,
      // _cube: c,
    };
  });

  return {
    // cubes: cubesSchema.safeParse(cubes),
    cubeCount: cubes.length,
    allCubes: cubes,
    dimensionsByCube: _cubes.map((cube) => {
      return {
        cubeIri: cube.term?.value,
        dimensions: getCubeDimensions({ cube, locale }),
      };
    }),
  };
};

export const getCubeDimensions = ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}) => {
  const outOpts = { language: getQueryLocales(locale) };

  const dimensions = cube.dimensions.map((dim) => {
    const isLiteral = dim.datatype ? true : false;

    console.log(dim);

    return {
      iri: dim.path?.value,
      isLiteral,
      datatype: dim.datatype?.value,
      name: dim.out(schema.name, outOpts)?.value,

      values: getCubeDimensionValues({ dimension: dim }),
    };
  });

  return { dimensions };
};

const getCubeDimensionValues = ({
  dimension,
}: {
  dimension: CubeDimension;
}) => {
  return {
    minInclusive: dimension.minInclusive,
    maxInclusive: dimension.maxInclusive,
    values: dimension.in,
  };
};
