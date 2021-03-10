import { dcat, dcterms, rdf, schema, vcard } from "@tpluscode/rdf-ns-builders";
import { string } from "io-ts";
import { Cube, CubeDimension, Source } from "rdf-cube-view-query";
import * as z from "zod";
import { parseObservationValue } from "../domain/data";
import { SPARQL_ENDPOINT } from "../domain/env";
import { ResolvedDataCube } from "../graphql/shared-types";
import { locales } from "../locales/locales";
import * as ns from "./namespace";
import { loadResourceLabels } from "./query-labels";

const getQueryLocales = (locale: string): string[] => [
  locale,
  ...locales.filter((l) => l !== locale),
  "*",
];

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

const parseCube = ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}): ResolvedDataCube => {
  const outOpts = { language: getQueryLocales(locale) };

  return {
    iri: cube.term?.value ?? "---",
    identifier: cube.out(dcterms.identifier)?.value ?? "---",
    title: cube.out(dcterms.title, outOpts)?.value ?? "---",
    description: cube.out(dcterms.description, outOpts)?.value ?? "",
    status: cube.out(schema.creativeWorkStatus)?.value,
    theme: cube.out(dcat.theme)?.value,
    datePublished: cube.out(schema.datePublished)?.value,
    versionHistory: cube.in(schema.hasPart)?.value,
    contactPoint: cube.out(dcat.contactPoint)?.out(vcard.fn)?.value,
    landingPage: cube.out(dcat.landingPage)?.value,
    keywords: cube.out(dcat.keyword)?.values,
    dataCube: cube,
  };
};

export const getCubes = async ({
  includeDrafts = true,
  locale,
}: {
  includeDrafts?: boolean;
  locale: string;
}): Promise<ResolvedDataCube[]> => {
  const source = createSource();

  const cubes = await source.cubes({
    filters: [
      // Deprecated cubes have a schema.org/validThrough property; Only show cubes that don't have it
      Cube.filter.noValidThrough(),
    ].concat(
      includeDrafts
        ? []
        : Cube.filter.status(ns.adminTerm("CreativeWorkStatus/Published"))
    ),
  });

  // See https://github.com/zazuko/cube-creator/blob/master/apis/core/bootstrap/shapes/dataset.ts for current list of cube metadata
  return cubes.map((cube) => parseCube({ cube, locale }));
};

export const getCube = async ({
  iri,
  locale,
}: {
  iri: string;
  locale: string;
}): Promise<ResolvedDataCube | null> => {
  const source = createSource();

  const cube = await source.cube(iri);

  return cube ? parseCube({ cube, locale }) : null;
};

export const getCubeDimensions = async ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}) => {
  const outOpts = { language: getQueryLocales(locale) };

  const dimensions = await Promise.all(
    cube.dimensions
      .filter(
        (dim) =>
          ![rdf.type.value, ns.cube.observedBy.value].includes(
            dim.path?.value ?? ""
          )
      )
      .map(async (dim) => {
        const isLiteral = dim.datatype ? true : false;

        return {
          iri: dim.path?.value,
          isLiteral,
          datatype: dim.datatype?.value,
          name: dim.out(schema.name, outOpts)?.value,
          values: await getCubeDimensionValues({ dimension: dim, cube }),
        };
      })
  );

  return dimensions;
};

const getCubeDimensionValues = async ({
  dimension,
  cube,
}: {
  dimension: CubeDimension;
  cube: Cube;
}) => {
  return {
    minInclusive: dimension.minInclusive
      ? parseObservationValue({ value: dimension.minInclusive })
      : undefined,
    maxInclusive: dimension.maxInclusive
      ? parseObservationValue({ value: dimension.maxInclusive })
      : undefined,
    values: dimension.in?.map((v) => parseObservationValue({ value: v })),
    valuesWithLabels: await getCubeDimensionValuesWithLabels({
      dimension,
      cube,
    }),
  };
};

const getCubeDimensionValuesWithLabels = async ({
  dimension,
  cube,
}: {
  dimension: CubeDimension;
  cube: Cube;
}) => {
  // try {
  //   const view = View.fromCube(cube);
  //   const viewDimension = view.dimension({ cubeDimension: dimension })!;

  //   const source = createSource();
  //   const lookupSource = LookupSource.fromSource(source);
  //   const lookupView = new View({ parent: source });

  //   const labelDimension = lookupView.createDimension({
  //     source: lookupSource,
  //     path: schema.name,
  //     join: viewDimension,
  //     as: ns.visualizeAdmin("dimensionValueLabel"),
  //   });

  //   lookupView.addDimension(viewDimension).addDimension(labelDimension);

  //   console.log(lookupView.observationsQuery().query.toString());
  // } catch (e) {
  //   console.log("Could not look up labels");
  //   console.error(e);
  // }

  const dimensionValueIris = dimension.in?.filter(
    (v) => v.termType === "NamedNode"
  );

  const dimensionValueLabels =
    dimensionValueIris && dimensionValueIris?.length > 0
      ? await loadResourceLabels(dimensionValueIris)
      : [];

  return dimensionValueLabels.map((vl) => {
    return {
      iri: vl.iri.value,
      label: vl.label.value,
    };
  });
};
