import { ascending } from "d3";
import uniqBy from "lodash/uniqBy";
import { OperationResult } from "urql";

import { Dimension, Observation, ObservationValue } from "@/domain/data";
import {
  DataCubeComponentsQuery,
  DataCubeComponentsQueryVariables,
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";

/** Use to exclude joinBy dimensions when fetching dimensions, and create
 * a new joinBy dimension with values from all joinBy dimensions.
 */
export const joinDimensions = (
  queries: OperationResult<
    DataCubeComponentsQuery,
    Exact<DataCubeComponentsQueryVariables>
  >[]
) => {
  const joinByDimensions: Dimension[] = [];
  const dimensions: Dimension[] = [];

  for (const q of queries) {
    if (!q.data?.dataCubeComponents) {
      continue;
    }

    const { dimensions: queryDimensions } = q.data.dataCubeComponents;

    const joinBy = q.operation.variables?.cubeFilter.joinBy;
    const joinByDimension = queryDimensions.find((d) => d.iri === joinBy);

    if (!joinByDimension) {
      dimensions.push(...queryDimensions);

      continue;
    }

    joinByDimensions.push(joinByDimension);
    dimensions.push(
      ...queryDimensions.filter((d) => d.iri !== joinByDimension.iri)
    );
  }

  if (joinByDimensions.length > 1) {
    const joinByDimension = joinByDimensions.slice(1).reduce<Dimension>(
      (acc, d) => {
        acc.values.push(...d.values);

        return acc;
      },
      {
        ...joinByDimensions[0],
        iri: "joinBy",
        cubeIri: "joinBy",
        label: "joinBy",
      }
    );
    joinByDimension.values = uniqBy(joinByDimension.values, "value").sort(
      (a, b) =>
        ascending(
          a.position ?? a.value ?? undefined,
          b.position ?? b.value ?? undefined
        )
    );
    dimensions.unshift(joinByDimension);
  }

  return dimensions;
};

type JoinByKey = NonNullable<
  DataCubeObservationsQueryVariables["cubeFilter"]["joinBy"]
>;

/** Use to merge observations coming from several DataCubesObservationQueries.
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
      const key: ObservationValue | undefined = o[joinBy];

      if (!key) {
        continue;
      }

      // Remove joinBy dimension from the observation, to use explicit joinBy as key
      const { [joinBy]: x, ...om } = o;
      om.joinBy = key;
      const existing: Observation | undefined = acc[key];
      // TODO: handle cases of same column names across merged observations
      acc[key] = Object.assign(existing ?? {}, om);
    }

    return acc;
  }, {});

  // Extract observations from the merged object indexed by joinBy value
  return Object.values(merged);
};
