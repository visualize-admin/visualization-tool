import { ascending } from "d3-array";
import groupBy from "lodash/groupBy";
import omit from "lodash/omit";
import uniq from "lodash/uniq";
import uniqBy from "lodash/uniqBy";
import { OperationResult } from "urql";

import { ChartConfig, Cube } from "@/config-types";
import {
  Dimension,
  isJoinByComponent,
  JoinByComponent,
  Observation,
  ObservationValue,
} from "@/domain/data";
import { ComponentId } from "@/graphql/make-component-id";
import {
  DataCubeComponentsQuery,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";
import { assert } from "@/utils/assert";

const JOIN_BY_CUBE_IRI = "joinBy";

const keyJoiner = "$/$/$/";
const joinByPrefix = `joinBy__`;

export const mkJoinById = (index: number) => `${joinByPrefix}${index}`;
export const isJoinById = (id: string) => id.startsWith(joinByPrefix);
export const isJoinByCube = (cubeIri: string) => cubeIri === JOIN_BY_CUBE_IRI;

const getJoinByIdIndex = (joinById: string) => {
  return Number(joinById.slice(joinByPrefix.length));
};

export const getOriginalDimension = (dim: JoinByComponent, cube: Cube) => {
  assert(isJoinByComponent(dim), "Dimension should be a join by at this point");
  const originalId = dim.originalIds.find(
    (o) => o.cubeIri === cube.iri
  )?.dimensionId;

  if (!originalId) {
    console.warn(
      "Could not find original id for joinBy dimension",
      dim,
      cube.iri
    );
  }

  assert(!!originalId, "Original id should have been found");

  return {
    ...dim,
    id: originalId,
  };
};

/** Use to exclude joinBy dimensions when fetching dimensions, and create
 * a new joinBy dimension with values from all joinBy dimensions.
 */
export const joinDimensions = (
  fetchedDataCubeComponents: {
    dataCubeComponents: DataCubeComponentsQuery["dataCubeComponents"];
    joinBy: string[] | undefined | null;
  }[]
) => {
  const joinByDimensions: (Dimension & { joinByIndex: undefined | number })[] =
    [];
  const dimensions: Dimension[] = [];

  for (const { dataCubeComponents, joinBy } of fetchedDataCubeComponents) {
    const { dimensions: queryDimensions } = dataCubeComponents;
    const {
      false: queryNormalDimensions = [],
      true: queryJoinByDimensions = [],
    } = groupBy(
      queryDimensions.map((d) => {
        return { ...d, joinByIndex: joinBy?.indexOf(d.id) };
      }),
      (d) => d.joinByIndex !== undefined && d.joinByIndex >= 0
    );

    joinByDimensions.push(...queryJoinByDimensions);
    dimensions.push(
      ...queryNormalDimensions.map((x) => omit(x, ["joinByIndex"]) as Dimension)
    );
  }

  if (joinByDimensions.length >= 1) {
    for (const [index, joinedDimensions] of Object.entries(
      groupBy(joinByDimensions, (d) => d.joinByIndex)
    ).reverse()) {
      const joinByDimension: Dimension = {
        ...(omit(joinedDimensions[0], ["joinByIndex"]) as Dimension),
        values: uniqBy(
          joinedDimensions
            .flatMap((d) => d.values ?? [])
            .sort((a, b) =>
              ascending(
                a.position ?? a.value ?? undefined,
                b.position ?? b.value ?? undefined
              )
            ),
          (x) => x.value
        ),
        id: mkJoinById(Number(index)),
        // Non-relevant, as we rely on the originalIris property.
        cubeIri: JOIN_BY_CUBE_IRI,
        // FIXME: adapt to design
        label: uniq(joinedDimensions.map((d) => d.label)).join(", "),
        isJoinByDimension: true,
        originalIds: joinedDimensions.map((d) => ({
          cubeIri: d.cubeIri,
          dimensionId: d.id as ComponentId,
          label: d.label,
          description: d.description ?? "",
        })),
      };
      dimensions.unshift(joinByDimension);
    }
  }

  return dimensions;
};

export const getOriginalIds = (joinById: string, chartConfig: ChartConfig) => {
  const index = getJoinByIdIndex(joinById);

  return chartConfig.cubes.map((cube) => {
    const joinBy = cube.joinBy;
    assert(joinBy !== undefined, "Found joinBy id and cube has no join by");

    return joinBy[index];
  });
};

export const getResolvedJoinById = (cube: Cube, joinById: string) => {
  if (!cube.joinBy) {
    return;
  }

  const index = getJoinByIdIndex(joinById);

  return cube.joinBy[index];
};

type JoinByKey = string;

/**
 * Use to merge observations coming from several DataCubesObservationQueries.
 *
 * Observations are merged by the value of the `joinBy` property of the cube filter.
 * The function does an outerJoin (returns all observations from all queries),
 * so if there are observations from different cubes with the same joinBy value,
 * they will be merged into one.
 */
export const mergeObservations = (
  queries: OperationResult<
    DataCubeObservationsQuery,
    Exact<DataCubeObservationsQueryVariables>
  >[]
): Observation[] => {
  const merged = queries.reduce<Record<JoinByKey, Observation>>((acc, q) => {
    const joinBy = q.operation.variables?.cubeFilter.joinBy;
    const obs = q.data?.dataCubeObservations.data;

    if (!obs || !joinBy) {
      return acc;
    }

    for (const o of obs) {
      // Remove joinBy dimensions from the observation, to use explicit joinBy as key
      const om = omit(o, joinBy) as Observation;

      const key: ObservationValue | undefined = joinBy
        .map((x) => o[x])!
        .join(keyJoiner);

      if (!key) {
        continue;
      }

      for (let i = 0; i < joinBy.length; i++) {
        if (o[joinBy[i]] !== undefined) {
          om[mkJoinById(i) as keyof typeof om] = o[joinBy[i]];
        }
      }
      const existing: Observation | undefined = acc[key];
      acc[key] = Object.assign(existing ?? {}, om);
    }

    return acc;
  }, {});

  // Extract observations from the merged object indexed by joinBy value
  return Object.values(merged);
};
