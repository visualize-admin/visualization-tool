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
import { dcterms, dcat, schema } from "@tpluscode/rdf-ns-builders";
import * as z from "zod";

const ns = {
  // dct: namespace("http://purl.org/dc/terms/"),
  energyPricing: namespace(
    "https://energy.ld.admin.ch/elcom/electricity-price/dimension/"
  ),
  energyPricingValue: namespace(
    "https://energy.ld.admin.ch/elcom/electricity-price/"
  ),
  rdf: namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#"),
  xsd: namespace("http://www.w3.org/2001/XMLSchema#"),
  classifications: namespace("http://classifications.data.admin.ch/"),
  schemaAdmin: namespace("https://schema.ld.admin.ch/"),
};

const getQueryLocales = (locale: string): string[] => [
  locale,
  ...locales.filter((l) => l !== locale),
  "*",
];

console.log(SPARQL_ENDPOINT);

const client = new ParsingClient({
  endpointUrl: "https://test.lindas.admin.ch/query",
});

const cubeSchema = z.object({
  iri: z.string().url(),
  identifier: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  publisher: z.string().optional(),
  theme: z.string().optional(),
  status: z.enum(["Draft", "Published"]).optional(),
});

const cubesSchema = z.array(cubeSchema);

const createSource = () =>
  new Source({
    sourceGraph: "https://lindas.admin.ch/foen/cube",
    endpointUrl: "https://test.lindas.admin.ch/query",
    // user: '',
    // password: ''
  });

export const getCubes = async ({ locale }: { locale: string }) => {
  const source = createSource();

  const _cubes = await source.cubes();

  const outOpts = { language: getQueryLocales(locale) };

  // See https://github.com/zazuko/cube-creator/blob/master/apis/core/bootstrap/shapes/dataset.ts for current list of cube metadata
  const cubes = _cubes.map((c) => {
    return {
      iri: c.term?.value,
      identifier: c.out(dcterms.identifier, outOpts)?.value,
      title: c.out(dcterms.title, outOpts)?.value,
      description: c.out(dcterms.description, outOpts)?.value,
      status: c.out(schema.creativeWorkStatus, outOpts)?.value,
      publisher: c.out(dcterms.publisher, outOpts)?.value,
      theme: c.out(dcat.theme, outOpts)?.value,
      _cube: c,
    };
  });

  return {
    cubes: cubesSchema.safeParse(cubes),
    dimensionsByCube: _cubes.map((cube) => {
      return {
        cubeIri: cube.term?.value,
        dimensions: getDimensions({ cube, locale }),
      };
    }),
  };
};

export const getDimensions = ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}) => {
  const outOpts = { language: getQueryLocales(locale) };

  const dimensions = cube.dimensions.map((dim) => {
    return {
      iri: dim.term?.value,
      datatype: dim.datatype?.value,
      name: dim.out(schema.name, outOpts)?.value,
    };
  });

  return { dimensions };
};
