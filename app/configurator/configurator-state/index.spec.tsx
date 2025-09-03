import { afterEach, describe, expect, it, vi } from "vitest";

import {
  ChartConfig,
  ComboLineDualConfig,
  ConfiguratorState,
  ConfiguratorStateConfiguringChart,
  ConfiguratorStatePublishing,
  DataSource,
  MapConfig,
} from "@/config-types";
import {
  getFiltersByMappingStatus,
  getFilterValue,
  moveFilterField,
} from "@/configurator/configurator-state";
import { publishState } from "@/configurator/configurator-state/context";
import {
  initChartStateFromChartCopy,
  initChartStateFromCube,
  initChartStateFromLocalStorage,
} from "@/configurator/configurator-state/init";
import { getLocalStorageKey } from "@/configurator/configurator-state/local-storage";
import { Dimension } from "@/domain/data";
import { stringifyComponentId } from "@/graphql/make-component-id";
import { data as fakeVizFixture } from "@/test/__fixtures/config/prod/line-1.json";
import { mockClient } from "@/test/urql-client-mock";
import * as api from "@/utils/chart-config/api";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

// @ts-ignore
const mockedApi = api as unknown as Mock<typeof api>;

vi.mock("@/utils/chart-config/api", () => ({
  createConfig: vi.fn(),
  fetchChartConfig: vi.fn(),
}));

afterEach(() => {
  vi.restoreAllMocks();
});

describe("initChartStateFromChart", () => {
  const setup = ({ chartConfig }: { chartConfig: object }) => {
    mockedApi.fetchChartConfig.mockResolvedValue(
      chartConfig as ReturnType<typeof api.fetchChartConfig>
    );
  };

  it("should fetch work if existing chart is valid", async () => {
    setup({
      chartConfig: {
        data: { ...fakeVizFixture, key: "abcde" },
      },
    });
    // @ts-ignore
    const { key, activeChartKey, chartConfigs, ...rest } =
      await initChartStateFromChartCopy(mockClient, "abcde");

    expect(key).toBe(undefined);

    const { key: chartConfigKey, ...chartConfig } = chartConfigs[0];
    const {
      key: migratedKey,
      activeChartKey: migratedActiveChartKey,
      chartConfigs: migratedChartsConfigs,
      ...migratedRest
    } = (await migrateConfiguratorState(
      fakeVizFixture
    )) as ConfiguratorStateConfiguringChart;
    const { key: migratedChartConfigKey, ...migratedChartConfig } =
      migratedChartsConfigs[0];

    expect(rest).toEqual(
      expect.objectContaining(migrateConfiguratorState(migratedRest))
    );
    expect(chartConfig).toEqual(migratedChartConfig);
  });

  it("should return undefined if chart is invalid", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    setup({
      chartConfig: {
        isBadState: true,
      },
    });
    const state = await initChartStateFromChartCopy(mockClient, "abcde");

    expect(state).toEqual(undefined);
  });
});

describe("initChartFromLocalStorage", () => {
  it("should initialize from localStorage if valid", async () => {
    localStorage.setItem(
      getLocalStorageKey("viz1234"),
      JSON.stringify({
        state: "CONFIGURING_CHART",
        published_state: "PUBLISHED",
        ...fakeVizFixture,
      })
    );
    const state = await initChartStateFromLocalStorage(mockClient, "viz1234");
    expect(state).not.toBeUndefined();
  });

  it("should return undefined and remove key from localStorage if invalid", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});

    localStorage.setItem(getLocalStorageKey("viz1234"), "abcde");
    const state = await initChartStateFromLocalStorage(mockClient, "viz1234");

    expect(state).toBeUndefined();
    expect(localStorage.getItem(getLocalStorageKey("viz1234"))).toBe(null);
  });
});

describe("initChartStateFromCube", () => {
  const dataSource: DataSource = {
    url: "https://example.com/api",
    type: "sparql",
  };

  it("should work init fields with existing dataset and go directly to 2nd step", async () => {
    const res = await initChartStateFromCube(
      mockClient,
      "https://environment.ld.admin.ch/foen/ubd0104/3/",
      dataSource,
      "en"
    );

    expect(res).toEqual(
      expect.objectContaining({
        state: "CONFIGURING_CHART",
      })
    );
  });

  it("should prefer possible filters if provided", async () => {
    const res = (await initChartStateFromCube(
      mockClient,
      "mapDataset",
      dataSource,
      "en"
    )) as ConfiguratorStateConfiguringChart;

    expect(res.chartConfigs[0].cubes[0].filters).toEqual({
      [stringifyComponentId({
        unversionedCubeIri: "mapDataset",
        unversionedComponentIri: "symbolLayerIri",
      })]: {
        type: "single",
        value: "xPossible",
      },
    });
  });
});

describe("moveField", () => {
  const chartConfig = {
    state: "CONFIGURING",
    cubes: [
      {
        iri: "",
        filters: {
          species: {
            type: "single",
            value: "penguins",
          },
          date: {
            type: "single",
            value: "2020.11.20",
          },
        },
      },
    ],
  } as unknown as ChartConfig;

  it("should be possible to move an existing field up", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimension: { id: "date", cubeIri: "" } as any as Dimension,
      delta: -1,
      possibleValues: ["2020.11.20", "2020.11.10"],
    });

    expect(Object.keys(newChartConfig.cubes[0].filters)).toEqual([
      "date",
      "species",
    ]);
    expect(Object.values(newChartConfig.cubes[0].filters)).toEqual([
      { type: "single", value: "2020.11.20" },
      { type: "single", value: "penguins" },
    ]);
  });

  it("should be possible to move an existing field down", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimension: { id: "species", cubeIri: "" } as any as Dimension,
      delta: 1,
      possibleValues: ["penguins", "tigers"],
    });

    expect(Object.keys(newChartConfig.cubes[0].filters)).toEqual([
      "date",
      "species",
    ]);
    expect(Object.values(newChartConfig.cubes[0].filters)).toEqual([
      { type: "single", value: "2020.11.20" },
      { type: "single", value: "penguins" },
    ]);
  });

  it("should be possible to move an absent field up", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimension: { id: "color", cubeIri: "" } as any as Dimension,
      delta: -1,
      possibleValues: ["red", "blue"],
    });

    expect(Object.keys(newChartConfig.cubes[0].filters)).toEqual([
      "species",
      "color",
      "date",
    ]);
    expect(Object.values(newChartConfig.cubes[0].filters)).toEqual([
      { type: "single", value: "penguins" },
      { type: "single", value: "red" },
      { type: "single", value: "2020.11.20" },
    ]);
  });

  it("should not be possible to move an existing field too much above", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimension: { id: "species", cubeIri: "" } as any as Dimension,
      delta: -1,
      possibleValues: ["penguins", "tigers"],
    });

    expect(Object.keys(newChartConfig.cubes[0].filters)).toEqual([
      "species",
      "date",
    ]);
    expect(Object.values(newChartConfig.cubes[0].filters)).toEqual([
      { type: "single", value: "penguins" },
      { type: "single", value: "2020.11.20" },
    ]);
  });

  it("should not be possible to move an existing field too much below", () => {
    const newChartConfig = moveFilterField(chartConfig, {
      dimension: { id: "date", cubeIri: "" } as any as Dimension,
      delta: 1,
      possibleValues: ["penguins", "tigers"],
    });

    expect(Object.keys(newChartConfig.cubes[0].filters)).toEqual([
      "species",
      "date",
    ]);
    expect(Object.values(newChartConfig.cubes[0].filters)).toEqual([
      { type: "single", value: "penguins" },
      { type: "single", value: "2020.11.20" },
    ]);
  });
});

describe("getFiltersByMappingStatus", () => {
  it("should correctly retrieve categorical color iris", () => {
    const config = {
      chartType: "map",
      cubes: [
        {
          iri: "foo",
          filters: {
            areaColorIri: {},
            symbolColorIri: {},
          },
        },
      ],
      fields: {
        areaLayer: {
          componentId: "areaIri",
          color: { type: "categorical", componentId: "areaColorIri" },
        },
        symbolLayer: {
          componentId: "symbolIri",
          color: { type: "categorical", componentId: "symbolColorIri" },
        },
      },
    } as any as MapConfig;

    const { mappedFiltersIds } = getFiltersByMappingStatus(config, {
      cubeIri: "foo",
    });

    expect([...mappedFiltersIds]).toEqual(
      expect.arrayContaining(["areaColorIri", "symbolColorIri"])
    );
  });

  it("should correctly retrieve filters when using joinBy dimension", () => {
    const config = {
      chartType: "line-dual",
      cubes: [
        {
          iri: "fo1",
          filters: {},
          joinBy: "X1",
        },
        {
          iri: "foo2",
          filters: {},
          joinBy: "X2",
        },
      ],
      fields: {
        x: {
          componentId: "joinBy",
        },
      },
    } as any as ComboLineDualConfig;

    const { mappedFiltersIds } = getFiltersByMappingStatus(config, {
      cubeIri: "foo",
      joinByIds: ["X1", "X2"],
    });

    // If the joinBy dimensions are treated as being mapped, we won't apply
    // single filters to them when deriving filters from fields.
    expect([...mappedFiltersIds]).toEqual(expect.arrayContaining(["X1", "X2"]));
  });
});

describe("publishing chart config", () => {
  it("should run correct number of times in singleURLs layout mode", async () => {
    const key = "ABC";
    const publishableChartKeys = ["A", "C"];
    const state = {
      state: "PUBLISHING",
      key,
      layout: {
        type: "singleURLs",
        publishableChartKeys,
      },
      chartConfigs: [
        { key: "A", cubes: [] },
        { key: "B", cubes: [] },
        { key: "C", cubes: [] },
      ],
    } as any as ConfiguratorStatePublishing;

    const cb = vi.fn();
    await publishState({} as any, key, state, async (_, i) => cb(i));

    expect(cb.mock.calls.map((c) => c[0])).toEqual(
      Array.from({ length: publishableChartKeys.length }, (_, i) => i + 1)
    );
  });
});

describe("getFilterValue", () => {
  const f = {
    type: "range",
    from: "2010",
    to: "2014",
  };
  const state = {
    state: "CONFIGURING_CHART",
    chartConfigs: [
      {
        cubes: [
          {
            iri: "foo",
            joinBy: ["first"],
            filters: {
              first: f,
            },
          },
          {
            iri: "bar",
            joinBy: ["second"],
            filters: {
              second: f,
            },
          },
        ],
      },
    ],
  } as any as ConfiguratorState;
  const dimension = {
    id: "joinBy__0",
    isJoinByDimension: true,
    originalIds: [{ dimensionId: "first" }, { dimensionId: "second" }],
  } as any as Dimension;

  it("should correctly retrieve filters for joinBy dimension", () => {
    expect(getFilterValue(state, dimension)).toEqual(f);
  });
});
