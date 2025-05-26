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
  // Mock chartConfigs
  const chartConfigs: ChartConfig[] = [
    { key: "chart1" } as ChartConfig,
    { key: "chart2" } as ChartConfig,
    { key: "chart3" } as ChartConfig,
  ];

  // Mock stores
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

  // Save the snapshot
  const restoreComponent1 = saveDataFiltersSnapshot(
    chartConfigs,
    stores,
    "component1"
  );

  // Manually modify the store
  setDataFilter(stores.chart1[2], "component1", "modified filter");
  setDataFilter(stores.chart1[2], "component2", "modified filter 2");

  const restoreComponent3 = saveDataFiltersSnapshot(
    chartConfigs,
    stores,
    "component3"
  );

  setDataFilter(stores.chart1[2], "component3", "modified filter 3");

  // Restore the snapshot
  restoreComponent1();

  // Check if the store is restored correctly
  expect(stores.chart1[2].getState()).toEqual({
    unrelated: 1,
    dataFilters: {
      // Filter 1 is restored
      component1: { type: "single", value: "filter1" },
      // Filter 2 is not restored
      component2: { type: "single", value: "modified filter 2" },
      // Filter 3 is not yet restored
      component3: { type: "single", value: "modified filter 3" },
    },
  });

  restoreComponent3();

  // Check if the store is restored correctly
  expect(stores.chart1[2].getState()).toEqual({
    unrelated: 1,
    dataFilters: {
      // Filter 1 is restored
      component1: { type: "single", value: "filter1" },
      // Filter 2 is not restored
      component2: { type: "single", value: "modified filter 2" },
      // Filter 3 is not there anymore
    },
  });
});
