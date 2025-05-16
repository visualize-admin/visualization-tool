import { act, render, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useMemo } from "react";
import { Client, Provider } from "urql";

import { ChartConfig } from "@/config-types";
import { DataCubeComponents, DataCubesObservations } from "@/domain/data";
import { useDataCubesComponentsQueryVariables } from "@/graphql/hooks.mock";
import { ComponentId } from "@/graphql/make-component-id";
import { Response } from "@/test/utils";

import {
  DataCubesComponentsOptions,
  DataCubesObservationsOptions,
  makeUseQuery,
  transformDataCubesComponents,
  transformDataCubesObservations,
  useDataCubesComponentsQuery,
} from "./hooks";

describe("makeUseQuery", () => {
  const mockQuery = jest.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      resolve({ data: "mock data", fetching: false });
    });
  });

  const useMockQuery = makeUseQuery({
    fetch: mockQuery,
  });

  afterEach(() => {
    mockQuery.mockClear();
  });

  const TestComponent = ({ variables }: { variables: any }) => {
    const [result] = useMockQuery({ variables });
    const client = useMemo(() => new Client({ url: "http://example.com" }), []);
    return (
      <Provider value={client}>
        <div data-testid="result">{result.data ?? "loading"}</div>
      </Provider>
    );
  };

  it("should return eventually the result of the executeQuery callback", async () => {
    const { getByTestId } = render(
      <TestComponent variables={{ cubeIri: "example1" }} />
    );

    expect(getByTestId("result").innerHTML).toEqual("loading");
    await waitFor(() =>
      expect(getByTestId("result").innerHTML).toEqual("mock data")
    );
  });

  it("should not re-execute the query if data is available", async () => {
    const { getByTestId, rerender } = render(
      <TestComponent variables={{ cubeIri: "example1" }} />
    );
    expect(getByTestId("result").innerHTML).toContain("loading");
    await waitFor(() =>
      expect(getByTestId("result").innerHTML).toEqual("mock data")
    );

    // Re-rendering without changing variables should not trigger the query again, and
    // the data should immediately be available
    rerender(<TestComponent variables={{ cubeIri: "example1" }} />);
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(getByTestId("result").innerHTML).toContain("mock data");
  });

  it("if the key changes between hook calls, it should not return the existing data", async () => {
    const { getByTestId, rerender } = render(
      <TestComponent variables={{ cubeIri: "example1" }} />
    );
    expect(getByTestId("result").innerHTML).toContain("loading");
    await waitFor(() =>
      expect(getByTestId("result").innerHTML).toEqual("mock data")
    );

    // content has been loaded, changing the key
    rerender(<TestComponent variables={{ cubeIri: "example2" }} />);
    expect(getByTestId("result").innerHTML).toContain("loading");

    // Wait for some time to ensure no data is loaded
    await waitFor(() => expect(mockQuery).toHaveBeenCalledTimes(2));
    await waitFor(() =>
      expect(getByTestId("result").innerHTML).toEqual("mock data")
    );

    // Re-rendering without changing variables should not trigger the query again, and
    // the data should immediately be available
    rerender(<TestComponent variables={{ cubeIri: "example2" }} />);
    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(getByTestId("result").innerHTML).toContain("mock data");
  });
});

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

describe("useComponentsQuery - keepPreviousData", () => {
  let originalFetch = global.fetch;
  beforeEach(() => {
    // @ts-ignore
    global.fetch = async (
      _url: RequestInfo | URL,
      options: RequestInit | undefined
    ) => {
      if (!options?.body) {
        throw Error("Must receive a body");
      }

      const reqBody = JSON.parse(options.body.toString());
      const isGebaudeCube = reqBody.variables.cubeFilter.iri.includes(
        "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6"
      );
      await sleep(1);
      return new Response(
        JSON.stringify({
          data: {
            dataCubeComponents: {
              dimensions: isGebaudeCube
                ? [
                    {
                      id: "https://gebaude",
                      label: "Gebaude",
                      cubeIri:
                        "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
                    },
                    {
                      id: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
                      label: "Year",
                      cubeIri:
                        "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
                    },
                  ]
                : [
                    {
                      id: "https://eletrik",
                      label: "Electrik",
                      cubeIri:
                        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
                    },
                    {
                      id: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                      label: "Year",
                      cubeIri:
                        "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
                    },
                  ],
              measures: [],
            },
          },
        })
      );
    };
  });

  afterEach(() => {
    // @ts-ignore
    global.fetch = originalFetch;
  });

  it("should work when keep previous data is false", async () => {
    await act(async () => {
      // Load for two cubes
      const hook = renderHook((props) => useDataCubesComponentsQuery(props), {
        initialProps: {
          chartConfig: {
            conversionUnitsByComponentId: {},
          } as ChartConfig,
          variables: useDataCubesComponentsQueryVariables.twoCubes,
        },
      });

      // At init, we are already fetching
      expect(hook.result.current[0].fetching).toBe(true);
      await hook.waitForNextUpdate();

      // Then the request is sent
      expect(hook.result.current[0].fetching).toBe(true);
      await hook.waitForNextUpdate();

      // We have received the update
      expect(hook.result.current[0].fetching).toBe(false);
      const dimensions =
        hook.result.current[0].data?.dataCubesComponents.dimensions;

      // The joinBy dimensions have been fused
      expect(dimensions && dimensions.length).toBe(3);

      expect(dimensions).toMatchInlineSnapshot(`
Array [
  Object {
    "cubeIri": "joinBy",
    "id": "joinBy__0",
    "isJoinByDimension": true,
    "label": "Year",
    "originalIds": Array [
      Object {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
        "description": "",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
        "label": "Year",
      },
      Object {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        "description": "",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        "label": "Year",
      },
    ],
    "values": Array [],
  },
  Object {
    "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
    "id": "https://gebaude",
    "label": "Gebaude",
  },
  Object {
    "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
    "id": "https://eletrik",
    "label": "Electrik",
  },
]
`);

      hook.rerender({
        chartConfig: {
          conversionUnitsByComponentId: {},
        } as ChartConfig,
        variables: useDataCubesComponentsQueryVariables.oneCube,
      });
      expect(hook.result.current[0].data).toBe(null);
      await hook.waitForNextUpdate();
      expect(hook.result.current[0].data).toEqual({
        dataCubesComponents: {
          dimensions: [
            {
              id: "https://gebaude",
              label: "Gebaude",
              cubeIri:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
            },
            {
              id: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
              label: "Year",
              cubeIri:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
            },
          ],
          measures: [],
        },
      });
    });
  });

  it("should work when keep previous data is true", async () => {
    await act(async () => {
      // Load for two cubes
      const hook = renderHook((props) => useDataCubesComponentsQuery(props), {
        initialProps: {
          chartConfig: {
            conversionUnitsByComponentId: {},
          } as ChartConfig,
          variables: useDataCubesComponentsQueryVariables.twoCubes,
          keepPreviousData: true,
        },
      });

      // At init, we are already fetching
      expect(hook.result.current[0].fetching).toBe(true);
      await hook.waitForNextUpdate();

      // We have received the update
      expect(hook.result.current[0].fetching).toBe(false);
      const dimensions =
        hook.result.current[0].data?.dataCubesComponents.dimensions;

      // The joinBy dimensions have been fused
      expect(dimensions && dimensions.length).toBe(3);

      expect(dimensions).toMatchInlineSnapshot(`
Array [
  Object {
    "cubeIri": "joinBy",
    "id": "joinBy__0",
    "isJoinByDimension": true,
    "label": "Year",
    "originalIds": Array [
      Object {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
        "description": "",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
        "label": "Year",
      },
      Object {
        "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
        "description": "",
        "dimensionId": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
        "label": "Year",
      },
    ],
    "values": Array [],
  },
  Object {
    "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
    "id": "https://gebaude",
    "label": "Gebaude",
  },
  Object {
    "cubeIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/9",
    "id": "https://eletrik",
    "label": "Electrik",
  },
]
`);

      hook.rerender({
        chartConfig: {
          conversionUnitsByComponentId: {},
        } as ChartConfig,
        variables: useDataCubesComponentsQueryVariables.oneCube,
        keepPreviousData: true,
      });
      expect(hook.result.current[0].data).toBeDefined();
      await hook.waitForNextUpdate();
      expect(hook.result.current[0].data).toEqual({
        dataCubesComponents: {
          dimensions: [
            {
              id: "https://gebaude",
              label: "Gebaude",

              cubeIri:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
            },
            {
              id: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
              label: "Year",
              cubeIri:
                "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/6",
            },
          ],
          measures: [],
        },
      });
    });
  });
});

describe("useDataCubesComponentsQuery", () => {
  describe("transformDataCubesComponents", () => {
    const measure1Id = "measure1" as ComponentId;
    const measure2Id = "measure2" as ComponentId;

    const mockData = {
      data: {
        dataCubesComponents: {
          dimensions: [],
          measures: [
            {
              id: measure1Id,
              label: "Measure 1",
              unit: "kg",
              cubeIri: "http://example.com/cube1",
              isNumerical: true,
              isKeyDimension: false,
              relatedLimitValues: [],
              values: [{ value: 100 }, { value: 200 }],
              limits: [
                { type: "single", value: 50 },
                { type: "range", from: 10, to: 20 },
              ],
            },
            {
              id: measure2Id,
              label: "Measure 2",
              unit: "m",
              cubeIri: "http://example.com/cube1",
              isNumerical: true,
              isKeyDimension: false,
              relatedLimitValues: [],
              values: [{ value: 30 }],
              limits: [],
            },
          ],
        } as unknown as DataCubeComponents,
      },
      fetching: false,
    };

    const mockOptions: DataCubesComponentsOptions & {
      chartConfig: ChartConfig;
    } = {
      chartConfig: {
        conversionUnitsByComponentId: {
          [measure1Id]: {
            multiplier: 2,
            labels: { en: "lbs", de: "pfund", fr: "livres", it: "libbre" },
          },
        },
      } as unknown as ChartConfig,
      variables: {
        locale: "en",
        sourceType: "sparql",
        sourceUrl: "http://example.com",
        cubeFilters: [],
      },
    };

    it("should transform measure values and limits with conversion units", () => {
      const result = transformDataCubesComponents(mockData, mockOptions);

      expect(result.data?.dataCubesComponents.measures[0]).toEqual({
        id: measure1Id,
        label: "Measure 1",
        unit: "lbs",
        cubeIri: "http://example.com/cube1",
        isNumerical: true,
        isKeyDimension: false,
        relatedLimitValues: [],
        values: [{ value: 200 }, { value: 400 }],
        limits: [
          { type: "single", value: 100 },
          { type: "range", from: 20, to: 40 },
        ],
      });

      expect(result.data?.dataCubesComponents.measures[1]).toEqual(
        mockData.data.dataCubesComponents.measures[1]
      );
    });

    it("should return unchanged data when no conversion units are provided", () => {
      const optionsWithoutConversion = {
        ...mockOptions,
        chartConfig: {
          ...mockOptions.chartConfig,
          conversionUnitsByComponentId: {},
        },
      };

      const result = transformDataCubesComponents(
        mockData,
        optionsWithoutConversion
      );
      expect(result).toEqual(mockData);
    });

    it("should return unchanged data when data is null", () => {
      const result = transformDataCubesComponents(
        { data: null, fetching: false },
        mockOptions
      );
      expect(result).toEqual({ data: null, fetching: false });
    });

    it("should return unchanged data when data is undefined", () => {
      const result = transformDataCubesComponents(
        { data: undefined, fetching: false },
        mockOptions
      );
      expect(result).toEqual({ data: undefined, fetching: false });
    });
  });

  it("should respect the conversion units in values", async () => {});
  it("should respect the conversion units in limits", async () => {});
});

describe("useDataCubesObservationsQuery", () => {
  describe("transformDataCubesObservations", () => {
    const measure1Id = "measure1" as ComponentId;
    const measure2Id = "measure2" as ComponentId;

    const mockData = {
      data: {
        dataCubesObservations: {
          data: [
            {
              [measure1Id]: 100,
              [measure2Id]: "200",
              measure3: 300,
              dimension1: "value1",
            },
            {
              [measure1Id]: "50",
              [measure2Id]: 75,
              measure3: "25",
              dimension1: "value2",
            },
          ],
          sparqlEditorUrls: [],
        } as unknown as DataCubesObservations,
      },
      fetching: false,
    };

    const mockOptions: DataCubesObservationsOptions & {
      chartConfig: ChartConfig;
    } = {
      chartConfig: {
        conversionUnitsByComponentId: {
          [measure1Id]: {
            multiplier: 2,
            labels: { en: "lbs", de: "pfund", fr: "livres", it: "libbre" },
          },
          [measure2Id]: {
            multiplier: 3,
            labels: { en: "lbs", de: "pfund", fr: "livres", it: "libbre" },
          },
        },
      } as unknown as ChartConfig,
      variables: {
        locale: "en",
        sourceType: "sparql",
        sourceUrl: "http://example.com",
        cubeFilters: [],
      },
    };

    it("should transform observation values with conversion units", () => {
      const result = transformDataCubesObservations(mockData, mockOptions);

      expect(result.data?.dataCubesObservations.data).toEqual([
        {
          [measure1Id]: 200,
          [measure2Id]: 600,
          measure3: 300,
          dimension1: "value1",
        },
        {
          [measure1Id as unknown as string]: 100,
          [measure2Id as unknown as string]: 225,
          measure3: "25",
          dimension1: "value2",
        },
      ]);
    });

    it("should return unchanged data when no conversion units are provided", () => {
      const optionsWithoutConversion = {
        ...mockOptions,
        chartConfig: {
          ...mockOptions.chartConfig,
          conversionUnitsByComponentId: {},
        },
      };

      const result = transformDataCubesObservations(
        mockData,
        optionsWithoutConversion
      );
      expect(result).toEqual(mockData);
    });

    it("should return unchanged data when data is null", () => {
      const result = transformDataCubesObservations(
        { data: null, fetching: false },
        mockOptions
      );
      expect(result).toEqual({ data: null, fetching: false });
    });

    it("should return unchanged data when data is undefined", () => {
      const result = transformDataCubesObservations(
        { data: undefined, fetching: false },
        mockOptions
      );
      expect(result).toEqual({ data: undefined, fetching: false });
    });
  });
});
