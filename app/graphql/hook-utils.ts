import { OperationResult } from "urql";

import { Observation, ObservationValue } from "@/domain/data";
import {
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";

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
  const merged = queries.reduce<
    //    <joinByKey,       Observation>
    Record<string | number, Observation>
  >((acc, q) => {
    const joinBy = q.operation.variables?.cubeFilter.joinBy!;
    const obs = q.data?.dataCubeObservations?.data!;

    for (const o of obs) {
      const key: ObservationValue | undefined = o[joinBy];

      if (!key) {
        continue;
      }

      const existing: Observation | undefined = acc[key];
      // TODO: handle cases of same column names across merged observations
      acc[key] = Object.assign(existing ?? {}, o);
    }

    return acc;
  }, {});

  // Extract observations from the merged object indexed by joinBy value
  return Object.values(merged);
};
