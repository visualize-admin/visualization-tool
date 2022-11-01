import { fireEvent, render } from "@testing-library/react";
import merge from "lodash/merge";
import { useState } from "react";

import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "@/charts/shared/use-interactive-filters";
import useSyncInteractiveFilters from "@/charts/shared/use-sync-interactive-filters";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  InteractiveFiltersConfig,
} from "@/configurator/config-types";
import fixture from "@/test/__fixtures/config/dev/4YL1p4QTFQS4.json";
const { handleInteractiveFilterChanged } = jest.requireActual(
  "@/configurator/configurator-state"
);

const interactiveFiltersConfig: InteractiveFiltersConfig = {
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
  timeSlider: {
    componentIri:
      "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/0",
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
};

const configuratorState = {
  state: "CONFIGURING_CHART",
  chartConfig: {
    interactiveFiltersConfig,
  },
} as unknown as ConfiguratorStateConfiguringChart;

jest.mock("@/configurator/configurator-state", () => {
  return {
    useConfiguratorState: () => {
      return [
        configuratorState,
        (action: {
          type: "INTERACTIVE_FILTER_CHANGED";
          value: InteractiveFiltersConfig;
        }) => {
          handleInteractiveFilterChanged(configuratorState, action);
        },
      ];
    },
  };
});

const chartConfig = {
  ...fixture.data.chartConfig,
  interactiveFiltersConfig,
} as ChartConfig;

const setup = ({
  modifiedChartConfig,
}: {
  modifiedChartConfig: ChartConfig;
}) => {
  const Component = () => {
    const [ifstate] = useInteractiveFilters();
    const [useModified, setUseModified] = useState(false);
    useSyncInteractiveFilters(useModified ? modifiedChartConfig : chartConfig);

    return (
      <div>
        <button
          data-testid="use-modified-button"
          onClick={() => setUseModified(true)}
        >
          use modified
        </button>
        <div data-testid="ifstate-dump">{JSON.stringify(ifstate)}</div>
      </div>
    );
  };
  const root = render(
    <InteractiveFiltersProvider>
      <Component />
    </InteractiveFiltersProvider>
  );
  const getIFState = () =>
    JSON.parse(root.getByTestId("ifstate-dump").innerHTML);
  const clickUseModified = () =>
    fireEvent.click(root.getByTestId("use-modified-button"));

  return { root, getIFState, clickUseModified };
};

describe("useSyncInteractiveFilters", () => {
  it("should keep interactive filters in sync with values from chart config", async () => {
    const { getIFState, clickUseModified } = setup({
      modifiedChartConfig: merge({}, chartConfig, {
        filters: {
          "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1": {
            value:
              "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1",
          },
        },
      }),
    });

    // interactive filters are initialized correctly
    const initIfState = getIFState();

    expect(
      initIfState.dataFilters[
        "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1"
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
        "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1"
      ]
    ).toEqual({
      type: "single",
      value:
        "http://environment.ld.admin.ch/foen/px/0703010000_103/dimension/1/1",
    });

    expect(
      configuratorState.chartConfig.interactiveFiltersConfig?.timeSlider
        .componentIri
    ).toEqual("");
    expect(IFState2.timeSlider.value).toBeUndefined();
  });
});
