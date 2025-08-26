import { cleanup, fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { Client, Provider } from "urql";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSyncInteractiveFilters } from "@/charts/shared/use-sync-interactive-filters";
import { ChartConfig, ConfiguratorStateConfiguringChart } from "@/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { ConfiguratorStateProvider } from "@/src";
import {
  InteractiveFiltersChartProvider,
  InteractiveFiltersProvider,
  useChartInteractiveFilters,
} from "@/stores/interactive-filters";
import fixture from "@/test/__fixtures/config/test/4YL1p4QTFQS4.json";
import { migrateChartConfig } from "@/utils/chart-config/versioning";

vi.mock("next-auth/react", async () => {
  const originalModule = await vi.importActual("next-auth/react");
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { username: "Test" },
  };

  return {
    __esModule: true,
    ...originalModule,
    useSession: vi.fn(() => {
      return { data: mockSession, status: "authenticated" }; // return type is [] in v3 but changed to {} in v4
    }),
  };
});

afterEach(() => {
  cleanup();
});

const getLegacyInteractiveFiltersConfig = () => ({
  legend: {
    componentIri: "https://fake-iri/dimension/0",
    active: false,
  },
  dataFilters: {
    active: true,
    componentIris: [
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1",
    ],
  },
  timeRange: {
    active: false,
    componentIri: "https://fake-iri/dimension/2",
    presets: {
      type: "range",
      from: "2021-01-01",
      to: "2021-01-12",
    },
  },
  calculation: {
    active: false,
    type: "identity",
  },
});

const setup = async ({
  modifiedChartConfig,
}: {
  modifiedChartConfig: ChartConfig;
}) => {
  const chartConfig = (await migrateChartConfig(
    {
      ...fixture.data.chartConfig,
      interactiveFiltersConfig: getLegacyInteractiveFiltersConfig(),
    },
    {
      migrationProps: {
        meta: {},
        dataSet: "foo",
        dataSource: {
          type: "sparql",
          url: "",
        },
      },
    }
  )) as ChartConfig;

  const Component = () => {
    const IFState = useChartInteractiveFilters((d) => ({
      categories: d.categories,
      timeRange: d.timeRange,
      timeSlider: d.timeSlider,
      dataFilters: d.dataFilters,
      calculation: d.calculation,
    }));
    const [useModified, setUseModified] = useState(false);
    useSyncInteractiveFilters(
      useModified ? modifiedChartConfig : chartConfig,
      undefined
    );

    return (
      <div>
        <button
          data-testid="use-modified-button"
          onClick={() => setUseModified(true)}
        >
          use modified
        </button>
        <div data-testid="ifstate-dump">{JSON.stringify(IFState)}</div>
      </div>
    );
  };

  const configState = {
    chartConfigs: [chartConfig],
  } as unknown as ConfiguratorStateConfiguringChart;

  const mockClient = new Client({
    url: "http://localhost",
  });

  const root = render(
    <Provider value={mockClient}>
      <ConfiguratorStateProvider chartId="published" initialState={configState}>
        <InteractiveFiltersProvider chartConfigs={configState.chartConfigs}>
          <InteractiveFiltersChartProvider chartConfigKey={chartConfig.key}>
            <Component />
          </InteractiveFiltersChartProvider>
        </InteractiveFiltersProvider>
      </ConfiguratorStateProvider>
    </Provider>
  );
  const getIFState = () => {
    const nodes = root.queryAllByTestId("ifstate-dump");
    const node = nodes[nodes.length - 1];
    return JSON.parse(node.innerHTML);
  };
  const clickUseModified = () =>
    fireEvent.click(root.getByTestId("use-modified-button"));

  return { root, getIFState, clickUseModified };
};

describe("useSyncInteractiveFilters", () => {
  it("should keep interactive filters in sync with values from chart config", async () => {
    const chartConfig = (await migrateChartConfig(
      {
        ...fixture.data.chartConfig,
        interactiveFiltersConfig: getLegacyInteractiveFiltersConfig(),
      },
      {
        migrationProps: {
          meta: {},
          dataSet: "foo",
          dataSource: {
            type: "sparql",
            url: "",
          },
        },
      }
    )) as ChartConfig;
    const { getIFState, clickUseModified } = await setup({
      modifiedChartConfig: {
        ...chartConfig,
        cubes: [
          {
            ...chartConfig.cubes[0],
            filters: {
              ...chartConfig.cubes[0].filters,
              "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1":
                {
                  type: "single",
                  value:
                    "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1",
                },
            },
          },
        ],
      },
    });

    // interactive filters are initialized correctly
    const initIfState = getIFState();

    expect(
      initIfState.dataFilters[
        "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1"
      ]
    ).toEqual({
      type: "single",
      value:
        "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0",
    });

    clickUseModified();

    const IFState2 = getIFState();
    expect(
      IFState2.dataFilters[
        "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1"
      ]
    ).toEqual({
      type: "single",
      value:
        "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1",
    });

    expect(IFState2.timeSlider.value).toBeUndefined();
  });

  it("applies default override changes for multi even after user selection", async () => {
    const chartConfig = (await migrateChartConfig(
      {
        ...fixture.data.chartConfig,
        interactiveFiltersConfig: getLegacyInteractiveFiltersConfig(),
      },
      {
        migrationProps: {
          meta: {},
          dataSet: "foo",
          dataSource: {
            type: "sparql",
            url: "",
          },
        },
      }
    )) as ChartConfig;

    const dimId =
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1";
    const val0 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0";
    const val1 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1";

    const modifiedChartConfig: ChartConfig = {
      ...chartConfig,
      cubes: [
        {
          ...chartConfig.cubes[0],
          filters: {
            ...chartConfig.cubes[0].filters,
            [dimId]: {
              type: "multi",
              values: { [val0]: true, [val1]: true },
            },
          },
        },
      ],
      interactiveFiltersConfig: {
        ...chartConfig.interactiveFiltersConfig,
        dataFilters: {
          ...chartConfig.interactiveFiltersConfig.dataFilters,
          componentIds: [dimId],
          defaultValueOverrides: { [dimId]: [val0] },
          active: true,
        },
      },
    } as ChartConfig;

    const Component = () => {
      const { dataFilters, update } = useChartInteractiveFilters((d) => ({
        dataFilters: d.dataFilters,
        update: d.updateDataFilter,
      }));
      const [useModified, setUseModified] = useState(false);
      useSyncInteractiveFilters(
        useModified
          ? {
              ...modifiedChartConfig,
              interactiveFiltersConfig: {
                ...modifiedChartConfig.interactiveFiltersConfig,
                dataFilters: {
                  ...modifiedChartConfig.interactiveFiltersConfig.dataFilters,
                  defaultValueOverrides: { [dimId]: [val1] },
                },
              },
            }
          : modifiedChartConfig,
        undefined
      );

      return (
        <div>
          <button data-testid="user-select" onClick={() => update(dimId, val0)}>
            select
          </button>
          <button
            data-testid="apply-override"
            onClick={() => setUseModified(true)}
          >
            override
          </button>
          <div data-testid="df">{JSON.stringify(dataFilters)}</div>
        </div>
      );
    };

    const configState = {
      chartConfigs: [modifiedChartConfig],
    } as unknown as ConfiguratorStateConfiguringChart;

    const mockClient = new Client({ url: "http://localhost" });

    const root = render(
      <Provider value={mockClient}>
        <ConfiguratorStateProvider
          chartId="published"
          initialState={configState}
        >
          <InteractiveFiltersProvider chartConfigs={configState.chartConfigs}>
            <InteractiveFiltersChartProvider
              chartConfigKey={modifiedChartConfig.key}
            >
              <Component />
            </InteractiveFiltersChartProvider>
          </InteractiveFiltersProvider>
        </ConfiguratorStateProvider>
      </Provider>
    );

    fireEvent.click(root.getByTestId("user-select"));
    const before = JSON.parse(root.getByTestId("df").innerHTML);
    expect(before[dimId].value).toBe(val0);

    fireEvent.click(root.getByTestId("apply-override"));
    const after = JSON.parse(root.getByTestId("df").innerHTML);
    expect(after[dimId].value).toBe(val1);
  });

  it("clears to NONE when multi removes current and override is invalid", async () => {
    const chartConfig = (await migrateChartConfig(
      {
        ...fixture.data.chartConfig,
        interactiveFiltersConfig: getLegacyInteractiveFiltersConfig(),
      },
      {
        migrationProps: {
          meta: {},
          dataSet: "foo",
          dataSource: {
            type: "sparql",
            url: "",
          },
        },
      }
    )) as ChartConfig;

    const dimId =
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1";
    const val0 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0";

    const initial: ChartConfig = {
      ...chartConfig,
      cubes: [
        {
          ...chartConfig.cubes[0],
          filters: {
            ...chartConfig.cubes[0].filters,
            [dimId]: {
              type: "multi",
              values: { [val0]: true },
            },
          },
        },
      ],
      interactiveFiltersConfig: {
        ...chartConfig.interactiveFiltersConfig,
        dataFilters: {
          ...chartConfig.interactiveFiltersConfig.dataFilters,
          componentIds: [dimId],
          defaultValueOverrides: {},
          active: true,
        },
      },
    } as ChartConfig;

    const modified: ChartConfig = {
      ...initial,
      cubes: [
        {
          ...initial.cubes[0],
          filters: {
            ...initial.cubes[0].filters,
            [dimId]: {
              type: "multi",
              values: {},
            },
          },
        },
      ],
    } as ChartConfig;

    const { getIFState, clickUseModified } = await setup({
      modifiedChartConfig: modified,
    });

    const init = getIFState();
    expect(init.dataFilters[dimId].value).toBe(val0);

    clickUseModified();
    const next = getIFState();
    expect(next.dataFilters[dimId].value).toBe(FIELD_VALUE_NONE);
  });

  it("ignores default override for non-multi and mirrors config single on mount", async () => {
    const chartConfig = (await migrateChartConfig(
      {
        ...fixture.data.chartConfig,
        interactiveFiltersConfig: getLegacyInteractiveFiltersConfig(),
      },
      {
        migrationProps: {
          meta: {},
          dataSet: "foo",
          dataSource: {
            type: "sparql",
            url: "",
          },
        },
      }
    )) as ChartConfig;

    const dimId =
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1";
    const val0 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0";
    const val1 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1";

    const singleConfig: ChartConfig = {
      ...chartConfig,
      cubes: [
        {
          ...chartConfig.cubes[0],
          filters: {
            ...chartConfig.cubes[0].filters,
            [dimId]: {
              type: "single",
              value: val1,
            },
          },
        },
      ],
      interactiveFiltersConfig: {
        ...chartConfig.interactiveFiltersConfig,
        dataFilters: {
          ...chartConfig.interactiveFiltersConfig.dataFilters,
          componentIds: [dimId],
          defaultValueOverrides: { [dimId]: [val0] },
          active: true,
        },
      },
    } as ChartConfig;

    const { getIFState, clickUseModified } = await setup({
      modifiedChartConfig: singleConfig,
    });

    clickUseModified();
    const state = getIFState();
    expect(state.dataFilters[dimId].value).toBe(val1);
  });

  it("applies override when multi has no config filter (all values allowed)", async () => {
    const chartConfig = (await migrateChartConfig(
      {
        ...fixture.data.chartConfig,
        interactiveFiltersConfig: getLegacyInteractiveFiltersConfig(),
      },
      {
        migrationProps: {
          meta: {},
          dataSet: "foo",
          dataSource: {
            type: "sparql",
            url: "",
          },
        },
      }
    )) as ChartConfig;

    const dimId =
      "foo(VISUALIZE.ADMIN_COMPONENT_ID_SEPARATOR)http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1";
    const val0 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/0";
    const val1 =
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1";

    const initial: ChartConfig = {
      ...chartConfig,
      // Ensure no config filter for the dimension (undefined => all allowed)
      cubes: [
        {
          ...chartConfig.cubes[0],
          filters: {
            // remove any existing entry for dimId
            ...Object.fromEntries(
              Object.entries(chartConfig.cubes[0].filters).filter(
                ([key]) => key !== dimId
              )
            ),
          },
        },
      ],
      interactiveFiltersConfig: {
        ...chartConfig.interactiveFiltersConfig,
        dataFilters: {
          ...chartConfig.interactiveFiltersConfig.dataFilters,
          componentIds: [dimId],
          defaultValueOverrides: { [dimId]: [val0] },
          active: true,
        },
      },
    } as ChartConfig;

    const Component = () => {
      const { dataFilters } = useChartInteractiveFilters((d) => ({
        dataFilters: d.dataFilters,
      }));
      const [override, setOverride] = useState(val0);
      useSyncInteractiveFilters(
        {
          ...initial,
          interactiveFiltersConfig: {
            ...initial.interactiveFiltersConfig,
            dataFilters: {
              ...initial.interactiveFiltersConfig.dataFilters,
              defaultValueOverrides: { [dimId]: [override] },
            },
          },
        },
        undefined
      );

      return (
        <div>
          <button
            data-testid="apply-override2"
            onClick={() => setOverride(val1)}
          >
            override2
          </button>
          <div data-testid="df2">{JSON.stringify(dataFilters)}</div>
        </div>
      );
    };

    const configState = {
      chartConfigs: [initial],
    } as unknown as ConfiguratorStateConfiguringChart;
    const mockClient = new Client({ url: "http://localhost" });

    const root = render(
      <Provider value={mockClient}>
        <ConfiguratorStateProvider
          chartId="published"
          initialState={configState}
        >
          <InteractiveFiltersProvider chartConfigs={configState.chartConfigs}>
            <InteractiveFiltersChartProvider chartConfigKey={initial.key}>
              <Component />
            </InteractiveFiltersChartProvider>
          </InteractiveFiltersProvider>
        </ConfiguratorStateProvider>
      </Provider>
    );

    // Initial override applied
    const before = JSON.parse(root.getByTestId("df2").innerHTML);
    expect(before[dimId].value).toBe(val0);

    // Change override, still should apply because all values allowed
    fireEvent.click(root.getByTestId("apply-override2"));
    const after = JSON.parse(root.getByTestId("df2").innerHTML);
    expect(after[dimId].value).toBe(val1);
  });
});
