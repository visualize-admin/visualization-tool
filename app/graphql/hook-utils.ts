import { ascending } from "d3-array";
import groupBy from "lodash/groupBy";
import omit from "lodash/omit";
import uniqBy from "lodash/uniqBy";
import { OperationResult } from "urql";

import { Dimension, Observation, ObservationValue } from "@/domain/data";
import {
  DataCubeComponentsQuery,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";

export const JOIN_BY_DIMENSION_IRI = "joinBy";
export const JOIN_BY_CUBE_IRI = "joinBy";

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
        return { ...d, joinByIndex: joinBy?.indexOf(d.iri) };
      }),
      (d) => d.joinByIndex !== undefined && d.joinByIndex >= 0
    );

    joinByDimensions.push(...queryJoinByDimensions);
    dimensions.push(
      ...queryNormalDimensions.map((x) => omit(x, ["joinByIndex"]) as Dimension)
    );
  }

  if (joinByDimensions.length > 1) {
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
        iri: `${JOIN_BY_DIMENSION_IRI}__${index}`,
        // Non-relevant, as we rely on the originalIris property.
        cubeIri: JOIN_BY_CUBE_IRI,
        // FIXME: adapt to design
        label: `${JOIN_BY_DIMENSION_IRI}__${index}`,
        isJoinByDimension: true,
        originalIris: joinedDimensions.map((d) => ({
          cubeIri: d.cubeIri,
          dimensionIri: d.iri,
          label: d.label,
        })),
      };
      dimensions.unshift(joinByDimension);
    }
  }

  return dimensions;
};

type JoinByKey = string;

const keyJoiner = "$/$/$/";

export const joinByDimensionId = (index: number) => `joinBy__${index}`;

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
          om[joinByDimensionId(i) as keyof typeof om] = o[joinBy[i]];
        }
      }
      const existing: Observation | undefined = acc[key];
      // TODO: handle cases of same column names across merged observations
      acc[key] = Object.assign(existing ?? {}, om);
    }

    return acc;
  }, {});

  // Extract observations from the merged object indexed by joinBy value
  return Object.values(merged);
};
