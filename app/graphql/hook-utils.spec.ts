import { OperationResult } from "urql";

import { Dimension } from "@/domain/data";
import { joinDimensions, mergeObservations } from "@/graphql/join";
import {
  DataCubeObservationsQuery,
  DataCubeObservationsQueryVariables,
  Exact,
} from "@/graphql/query-hooks";

describe("mergeObservations", () => {
  it("should merge observations with a single join by", () => {
    const queries = [
      {
        data: {
          dataCubeObservations: {
            data: [
              { year: 2010, amount: 2010 }, // mergeable
              { year: 2011, amount: 2011 },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["year"],
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
              joinBy: ["YEAR"],
            },
          },
        },
      },
      {
        data: undefined,
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR"],
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
      { joinBy__0: 2000, AMOUNT: 2000 },
      { joinBy__0: 2010, amount: 2010, AMOUNT: 2010 },
      { joinBy__0: 2011, amount: 2011 },
      { joinBy__0: 2020, AMOUNT: 2020 },
    ]);
  });

  it("should merge observations with multiple join bys", () => {
    const queries = [
      {
        data: {
          dataCubeObservations: {
            data: [
              { year: 2010, period: 0, amount: "2010_0" }, // mergeable
              { year: 2010, period: 1, amount: "2010_1" },
              { year: 2011, period: 0, amount: "2011_0" },
              { year: 2011, period: 1, amount: "2011_1" },
              { year: 2020, period: 1, amount: "2020_1" }, // mergeable
              { year: 2020, period: 0, amount: "2020_1" },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["year", "period"],
            },
          },
        },
      },
      {
        data: {
          dataCubeObservations: {
            data: [
              { YEAR: 2000, PERIOD: 0, AMOUNT: "2000_0" },
              { YEAR: 2000, PERIOD: 1, AMOUNT: "2000_1" },
              { YEAR: 2010, PERIOD: 0, AMOUNT: "2010_0" },
              { YEAR: 2020, PERIOD: 1, AMOUNT: "2020_1" },
            ],
          },
        },
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR", "PERIOD"],
            },
          },
        },
      },
      {
        data: undefined,
        operation: {
          variables: {
            cubeFilter: {
              joinBy: ["YEAR", "PERIOD"],
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

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "AMOUNT": "2010_0",
          "amount": "2010_0",
          "joinBy__0": 2010,
          "joinBy__1": 0,
        },
        Object {
          "amount": "2010_1",
          "joinBy__0": 2010,
          "joinBy__1": 1,
        },
        Object {
          "amount": "2011_0",
          "joinBy__0": 2011,
          "joinBy__1": 0,
        },
        Object {
          "amount": "2011_1",
          "joinBy__0": 2011,
          "joinBy__1": 1,
        },
        Object {
          "AMOUNT": "2020_1",
          "amount": "2020_1",
          "joinBy__0": 2020,
          "joinBy__1": 1,
        },
        Object {
          "amount": "2020_1",
          "joinBy__0": 2020,
          "joinBy__1": 0,
        },
        Object {
          "AMOUNT": "2000_0",
          "joinBy__0": 2000,
          "joinBy__1": 0,
        },
        Object {
          "AMOUNT": "2000_1",
          "joinBy__0": 2000,
          "joinBy__1": 1,
        },
      ]
    `);
  });
});

describe("joinDimensions", () => {
  it("should join dimensions correctly", () => {
    const fetchedDataCubeComponents = [
      {
        dataCubeComponents: {
          measures: [],
          dimensions: [
            {
              cubeIri: "population",
              iri: "population",
              label: "Population",
            } as Dimension,
            {
              cubeIri: "population",
              iri: "year",
              label: "Year",
            } as Dimension,
            {
              cubeIri: "population",
              iri: "canton",
              label: "Canton",
              values: [{ value: "Bern" }, { value: "Zürich" }],
            } as unknown as Dimension,
          ],
        },
        joinBy: ["year", "canton"],
      },
      {
        dataCubeComponents: {
          measures: [],
          dimensions: [
            {
              cubeIri: "elec",
              iri: "electricalConsumption",
              label: "Electrical Consumption",
            } as Dimension,
            {
              cubeIri: "elec",
              iri: "YEAR",
              label: "Year",
            } as Dimension,
            {
              cubeIri: "elec",
              iri: "CANTON",
              label: "Canton",
              values: [
                { value: "Bern" },
                { value: "Zürich" },
                { value: "Appenzeller" },
              ],
            } as unknown as Dimension,
          ],
        },
        joinBy: ["YEAR", "CANTON"],
      },
    ];

    const result = joinDimensions(fetchedDataCubeComponents);

    expect(result).toMatchInlineSnapshot(`
      Array [
        Object {
          "cubeIri": "joinBy",
          "iri": "joinBy__0",
          "isJoinByDimension": true,
          "label": "Year",
          "originalIris": Array [
            Object {
              "cubeIri": "population",
              "dimensionIri": "year",
              "label": "Year",
            },
            Object {
              "cubeIri": "elec",
              "dimensionIri": "YEAR",
              "label": "Year",
            },
          ],
          "values": Array [],
        },
        Object {
          "cubeIri": "joinBy",
          "iri": "joinBy__1",
          "isJoinByDimension": true,
          "label": "Canton",
          "originalIris": Array [
            Object {
              "cubeIri": "population",
              "dimensionIri": "canton",
              "label": "Canton",
            },
            Object {
              "cubeIri": "elec",
              "dimensionIri": "CANTON",
              "label": "Canton",
            },
          ],
          "values": Array [
            Object {
              "value": "Appenzeller",
            },
            Object {
              "value": "Bern",
            },
            Object {
              "value": "Zürich",
            },
          ],
        },
        Object {
          "cubeIri": "population",
          "iri": "population",
          "label": "Population",
        },
        Object {
          "cubeIri": "elec",
          "iri": "electricalConsumption",
          "label": "Electrical Consumption",
        },
      ]
    `);
  });
});
