import { describe, expect, it } from "vitest";

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

describe("Dashboard Interactive Filters", () => {
  describe("saveDataFiltersSnapshot", () => {
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

    it("should handle multiple filters for the same component", () => {
      const chartConfigs: ChartConfig[] = [{ key: "chart1" } as ChartConfig];

      const stores = {
        chart1: mockDashboardInteractiveFiltersContextValue({
          dataFilters: {
            component1: { type: "single", value: "filter1" },
            component2: { type: "single", value: "filter2" },
          },
        }),
      };

      const restoreComponent1 = saveDataFiltersSnapshot(
        chartConfigs,
        stores,
        "component1"
      );

      setDataFilter(stores.chart1[2], "component1", "modified filter1");
      setDataFilter(stores.chart1[2], "component2", "modified filter2");

      restoreComponent1();

      expect(stores.chart1[2].getState()).toEqual({
        dataFilters: {
          component1: { type: "single", value: "filter1" },
          component2: { type: "single", value: "modified filter2" },
        },
      });
    });

    it("should handle non-existent component gracefully", () => {
      const chartConfigs: ChartConfig[] = [{ key: "chart1" } as ChartConfig];

      const stores = {
        chart1: mockDashboardInteractiveFiltersContextValue({
          dataFilters: {
            component1: { type: "single", value: "filter1" },
          },
        }),
      };

      const restoreNonExistent = saveDataFiltersSnapshot(
        chartConfigs,
        stores,
        "non-existent-component"
      );

      setDataFilter(stores.chart1[2], "component1", "modified filter");

      restoreNonExistent();

      expect(stores.chart1[2].getState()).toEqual({
        dataFilters: {
          component1: { type: "single", value: "modified filter" },
        },
      });
    });

    it("should handle empty data filters", () => {
      const chartConfigs: ChartConfig[] = [{ key: "chart1" } as ChartConfig];

      const stores = {
        chart1: mockDashboardInteractiveFiltersContextValue({
          dataFilters: {},
        }),
      };

      const restoreComponent1 = saveDataFiltersSnapshot(
        chartConfigs,
        stores,
        "component1"
      );

      setDataFilter(stores.chart1[2], "component1", "new filter");

      restoreComponent1();

      expect(stores.chart1[2].getState()).toEqual({
        dataFilters: {},
      });
    });

    it("should handle multiple chart configs with different states", () => {
      const chartConfigs: ChartConfig[] = [
        { key: "chart1" } as ChartConfig,
        { key: "chart2" } as ChartConfig,
      ];

      const stores = {
        chart1: mockDashboardInteractiveFiltersContextValue({
          dataFilters: { component1: { type: "single", value: "filter1" } },
        }),
        chart2: mockDashboardInteractiveFiltersContextValue({
          dataFilters: { component1: { type: "single", value: "filter2" } },
        }),
      };

      const restoreComponent1 = saveDataFiltersSnapshot(
        chartConfigs,
        stores,
        "component1"
      );

      setDataFilter(stores.chart1[2], "component1", "modified filter1");
      setDataFilter(stores.chart2[2], "component1", "modified filter2");

      restoreComponent1();

      expect(stores.chart1[2].getState()).toEqual({
        dataFilters: { component1: { type: "single", value: "filter1" } },
      });

      expect(stores.chart2[2].getState()).toEqual({
        dataFilters: { component1: { type: "single", value: "filter2" } },
      });
    });
  });
});
