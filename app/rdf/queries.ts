import { Cube, CubeDimension, Source } from "rdf-cube-view-query";
import { ObservationValue, parseObservationValue } from "../domain/data";
import { SPARQL_ENDPOINT } from "../domain/env";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";
import * as ns from "./namespace";
import { parseCube, parseCubeDimension } from "./parse";
import { loadResourceLabels } from "./query-labels";

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

export const getCubeDimensions = ({
  cube,
  locale,
}: {
  cube: Cube;
  locale: string;
}): ResolvedDimension[] => {
  try {
    const dimensions = cube.dimensions
      .filter(
        (dim) =>
          dim.path &&
          ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
            dim.path.value ?? ""
          )
      )
      .map((dim) => {
        return parseCubeDimension({ dim, cube, locale });
      });
    return dimensions;
  } catch (e) {
    console.error(e);

    return [];
  }
};

export const getCubeDimensionValues = async ({
  dimension,
  cube,
}: {
  dimension: CubeDimension;
  cube: Cube;
}): Promise<{ value: string; label: string }[]> => {
  if (
    dimension.minInclusive !== undefined &&
    dimension.maxInclusive !== undefined
  ) {
    const min = parseObservationValue({ value: dimension.minInclusive });
    const max = parseObservationValue({ value: dimension.maxInclusive });
    console.log({ min, max });
    return [
      { value: min.toString(), label: min.toString() },
      { value: max.toString(), label: max.toString() },
    ];
  }

  return await getCubeDimensionValuesWithLabels({
    dimension,
    cube,
  });
};

const getCubeDimensionValuesWithLabels = async ({
  dimension,
  cube,
}: {
  dimension: CubeDimension;
  cube: Cube;
}): Promise<{ value: string; label: string }[]> => {
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
      value: vl.iri.value,
      label: vl.label.value,
    };
  });
};
