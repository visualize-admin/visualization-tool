import { fireEvent, render } from "@testing-library/react";
import { useState } from "react";
import { Client, Provider } from "urql";
import { describe, expect, it, vi } from "vitest";

import useSyncInteractiveFilters from "@/charts/shared/use-sync-interactive-filters";
import { ChartConfig, ConfiguratorStateConfiguringChart } from "@/config-types";
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
  const getIFState = () =>
    JSON.parse(root.getByTestId("ifstate-dump").innerHTML);
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
});
