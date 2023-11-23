import { OperationResult } from "urql";

import { mergeObservations } from "@/graphql/hook-utils";
import {
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";

// FIXME: figure out why mergeObservations import fails
describe("mergeObservations", () => {
  it.skip("should merge observations", () => {
    const queries = [
      {
        data: {
          dataCubeObservations: [
            { year: 2010, amount: 2010 },
            { year: 2011, amount: 2011 },
          ],
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: "year",
            },
          },
        },
      },
      {
        data: {
          dataCubeObservations: [
            { YEAR: 2000, AMOUNT: 2000 },
            { YEAR: 2010, AMOUNT: 2010 },
            { YEAR: 2020, AMOUNT: 2020 },
          ],
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: "YEAR",
            },
          },
        },
      },
    ] as any as OperationResult<
      DataCubeObservationsQuery,
      Exact<DataCubeObservationsQueryVariables>
    >[];

    const result = mergeObservations(queries);

    expect(result).toEqual([
      { YEAR: 2000, AMOUNT: 2000 },
      { year: 2010, amount: 2010, YEAR: 2010, AMOUNT: 2010 },
      { year: 2011, amount: 2011 },
      { YEAR: 2020, AMOUNT: 2020 },
    ]);
  });
});
