import { act, render, waitFor } from "@testing-library/react";
import { renderHook } from "@testing-library/react-hooks";

import { useDataCubesComponentsQueryVariables } from "@/graphql/hooks.mock";
import { Response } from "@/test/utils";

import { makeUseQuery, useDataCubesComponentsQuery } from "./hooks"; // Assuming your makeUseQuery function is in a separate file

describe("makeUseQuery", () => {
  const mockQuery = jest.fn().mockImplementation(() => {
    return new Promise((resolve) => {
      resolve({ data: "mock data", fetching: false });
    });
  });

  const useMockQuery = makeUseQuery(mockQuery);

  afterEach(() => {
    mockQuery.mockClear();
  });

  const TestComponent = ({ variables }: { variables: any }) => {
    const [result] = useMockQuery({ variables });
    return <div data-testid="result">{result.data ?? "loading"}</div>;
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

describe("useComponentsQuery - keepPreviousData: false", () => {
  it("should work", async () => {
    global.fetch = async (
      _url: RequestInfo | URL,
      options: RequestInit | undefined
    ) => {
      if (!options?.body) {
        throw new Error("Must receive a body");
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
                      iri: "https://gebaude",
                    },
                    {
                      iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
                    },
                  ]
                : [
                    {
                      iri: "https://eletrik",
                    },
                    {
                      iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                    },
                  ],
              measures: [],
            },
          },
        })
      );
    };

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
            "iri": "joinBy",
            "isJoinByDimension": true,
            "label": "joinBy",
            "originalIris": Array [
              Object {
                "cubeIri": undefined,
                "dimensionIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
                "label": undefined,
              },
              Object {
                "cubeIri": undefined,
                "dimensionIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                "label": undefined,
              },
            ],
            "values": Array [
              undefined,
              undefined,
            ],
          },
          Object {
            "iri": "https://gebaude",
          },
          Object {
            "iri": "https://eletrik",
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
            { iri: "https://gebaude" },
            {
              iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
            },
          ],
          measures: [],
        },
      });
    });
  });
});

describe("useComponentsQuery - keepPreviousData: true", () => {
  it("should work", async () => {
    global.fetch = async (
      _url: RequestInfo | URL,
      options: RequestInit | undefined
    ) => {
      if (!options?.body) {
        throw new Error("Must receive a body");
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
                      iri: "https://gebaude",
                    },
                    {
                      iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
                    },
                  ]
                : [
                    {
                      iri: "https://eletrik",
                    },
                    {
                      iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                    },
                  ],
              measures: [],
            },
          },
        })
      );
    };

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
            "iri": "joinBy",
            "isJoinByDimension": true,
            "label": "joinBy",
            "originalIris": Array [
              Object {
                "cubeIri": undefined,
                "dimensionIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
                "label": undefined,
              },
              Object {
                "cubeIri": undefined,
                "dimensionIri": "https://energy.ld.admin.ch/sfoe/bfe_ogd84_einmalverguetung_fuer_photovoltaikanlagen/Jahr",
                "label": undefined,
              },
            ],
            "values": Array [
              undefined,
              undefined,
            ],
          },
          Object {
            "iri": "https://gebaude",
          },
          Object {
            "iri": "https://eletrik",
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
            { iri: "https://gebaude" },
            {
              iri: "https://energy.ld.admin.ch/sfoe/bfe_ogd18_gebaeudeprogramm_energiewirkung/Jahr",
            },
          ],
          measures: [],
        },
      });
    });
  });
});
