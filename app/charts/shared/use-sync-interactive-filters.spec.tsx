import useSyncInteractiveFilters from "./use-sync-interactive-filters";
import fixture from "../../test/__fixtures/dev/4YL1p4QTFQS4.json";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "./use-interactive-filters";
import { fireEvent, render } from "@testing-library/react";
import { ChartConfig } from "../../configurator";
import { useState } from "react";
import { merge } from "lodash";

const chartConfig = {
  ...fixture.data.chartConfig,
  interactiveFiltersConfig: {
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
    time: {
      active: false,
      componentIri: "https://fake-iri/dimension/2",
      presets: {
        type: "range",
        from: "2021-01-01",
        to: "2021-01-12",
      },
    },
  },
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
  });
});
