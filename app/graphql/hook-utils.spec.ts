import { OperationResult } from "urql";

import { mergeObservations } from "@/graphql/hook-utils";
import {
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";

describe("mergeObservations", () => {
  it("should merge observations", () => {
    const queries = [
      {
        data: {
          dataCubeObservations: {
            data: [
              { year: 2010, amount: 2010 },
              { year: 2011, amount: 2011 },
            ],
          },
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
          dataCubeObservations: {
            data: [
              { YEAR: 2000, AMOUNT: 2000 },
              { YEAR: 2010, AMOUNT: 2010 },
              { YEAR: 2020, AMOUNT: 2020 },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: "YEAR",
            },
          },
        },
      },
      {
        data: undefined,
        operation: {
          variables: {
            cubeFilter: {
              joinBy: "YEAR",
            },
          },
        },
      },
      {
        data: { dataCubeObservations: [] },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: undefined,
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
      { joinBy: 2000, AMOUNT: 2000 },
      { joinBy: 2010, amount: 2010, AMOUNT: 2010 },
      { joinBy: 2011, amount: 2011 },
      { joinBy: 2020, AMOUNT: 2020 },
    ]);
  });
});
