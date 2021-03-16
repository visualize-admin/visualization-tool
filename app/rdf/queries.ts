import {
  Cube,
  CubeDimension,
  CubeSource,
  LookupSource,
  Source,
  View,
} from "rdf-cube-view-query";
import { parseObservationValue } from "../domain/data";
import { SPARQL_ENDPOINT } from "../domain/env";
import { ResolvedDataCube, ResolvedDimension } from "../graphql/shared-types";
import * as ns from "./namespace";
import { getQueryLocales, parseCube, parseCubeDimension } from "./parse";
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

export const getCubeObservations = async ({
  cube,
  locale,
  limit,
}: {
  cube: Cube;
  locale: string;
  limit?: number;
}): Promise<{ query: string; observations: $FixMe[] }> => {
  const view = View.fromCube(cube);

  // Only choose dimensions that we really want
  let dimensions = view.dimensions.filter((d) =>
    d.cubeDimensions.every(
      (cd) =>
        cd.path &&
        ![ns.rdf.type.value, ns.cube.observedBy.value].includes(
          cd.path.value ?? ""
        )
    )
  );

  /**
   * Add labels to named dimensions
   */

  // Find dimensions which are NOT literal
  const namedDimensions = getCubeDimensions({ cube, locale }).filter(
    ({ isLiteral }) => !isLiteral
  );

  const lookupSource = LookupSource.fromSource(cube.source);

  let filterDimensions = [...dimensions];
  let filters = [];
  for (const dimension of namedDimensions) {
    const labelDimension = view.createDimension({
      source: lookupSource,
      path: ns.schema.name,
      join: view.dimension({ cubeDimension: dimension.iri }),
      as: dimension.iri, // Is it correct to "replace" the original dimension with the same IRI like this?
    });

    filterDimensions.push(labelDimension);
    filters.push(labelDimension.filter.lang(getQueryLocales(locale)));
  }

  const filterView = new View({ dimensions: filterDimensions, filters });

  /**
   * Add LIMIT to query
   */
  if (limit !== undefined) {
    // From https://github.com/zazuko/cube-creator/blob/a32a90ff93b2c6c1c5ab8fd110a9032a8d179670/apis/core/lib/domain/observations/lib/index.ts#L41
    filterView.ptr.addOut(ns.cubeView.projection, (projection: $FixMe) => {
      // const order = projection
      //   .blankNode()
      //   .addOut(ns.cubeView.dimension, view.dimensions[0].ptr)
      //   .addOut(ns.cubeView.direction, ns.cubeView.Ascending);

      // projection.addList(ns.cubeView.orderBy, order)
      projection.addOut(ns.cubeView.limit, limit);
      // projection.addOut(ns.cubeView.offset, offset)
    });
  }

  const result = {
    query: filterView.observationsQuery().query.toString(),
    observations: await filterView.observations(),
  };

  return result;
};
