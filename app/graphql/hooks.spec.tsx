import { act, render, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";
import { useMemo } from "react";
import { Client, Provider } from "urql";

import { useDataCubesComponentsQueryVariables } from "@/graphql/hooks.mock";
import { Response } from "@/test/utils";

import { makeUseQuery, useDataCubesComponentsQuery } from "./hooks"; // Assuming your makeUseQuery function is in a separate file

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
