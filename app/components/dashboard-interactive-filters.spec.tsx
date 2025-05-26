import { expect, it } from "vitest";

import { saveDataFiltersSnapshot } from "@/components/dashboard-interactive-filters";
import { ChartConfig } from "@/configurator";
import {
  InteractiveFiltersContextValue,
  setDataFilter,
} from "@/stores/interactive-filters";

class MockState<T = unknown> {
  private _state: any;

  constructor(state: T) {
    this._state = state;
  }

  getState() {
    return this._state;
  }

  setState(newState: any) {
    Object.assign(this._state, newState);
  }
}

const mockDashboardInteractiveFiltersContextValue = <T extends unknown>(
  state: T
) => {
  return [
    null,
    null,
    new MockState(state),
  ] as unknown as InteractiveFiltersContextValue;
};

it("Save snapshot, modify the store manually, then restore and check result", () => {
  const chartConfigs: ChartConfig[] = [
    { key: "chart1" } as ChartConfig,
    { key: "chart2" } as ChartConfig,
    { key: "chart3" } as ChartConfig,
  ];

  const stores = {
    chart1: mockDashboardInteractiveFiltersContextValue({
      unrelated: 1,
      dataFilters: { component1: { type: "single", value: "filter1" } },
    }),
    chart2: mockDashboardInteractiveFiltersContextValue({
      dataFilters: { component2: { type: "single", value: "filter2" } },
    }),
    chart3: mockDashboardInteractiveFiltersContextValue({
      dataFilters: { component3: { type: "single", value: "filter3" } },
    }),
  };

  const restoreComponent1 = saveDataFiltersSnapshot(
    chartConfigs,
    stores,
    "component1"
  );

  setDataFilter(stores.chart1[2], "component1", "modified filter");
  setDataFilter(stores.chart1[2], "component2", "modified filter 2");

  const restoreComponent3 = saveDataFiltersSnapshot(
    chartConfigs,
    stores,
    "component3"
  );

  setDataFilter(stores.chart1[2], "component3", "modified filter 3");

  restoreComponent1();

  expect(stores.chart1[2].getState()).toEqual({
    unrelated: 1,
    dataFilters: {
      component1: { type: "single", value: "filter1" },
      component2: { type: "single", value: "modified filter 2" },
      component3: { type: "single", value: "modified filter 3" },
    },
  });

  restoreComponent3();

  expect(stores.chart1[2].getState()).toEqual({
    unrelated: 1,
    dataFilters: {
      component1: { type: "single", value: "filter1" },
      component2: { type: "single", value: "modified filter 2" },
    },
  });
});
