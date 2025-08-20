import { SelectChangeEvent } from "@mui/material";
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { InteractiveFiltersConfig } from "@/config-types";
import { FIELD_VALUE_NONE } from "@/configurator/constants";

import {
  toggleInteractiveFilterDataDimension,
  useDefaultValueOverride,
  useInteractiveDataFilterToggle,
  useInteractiveTimeRangeToggle,
} from "./interactive-filters-config-state";

let mockDispatch: ReturnType<typeof vi.fn>;

vi.mock("@/configurator/configurator-state", () => ({
  isConfiguring: vi.fn(() => true),
  useConfiguratorState: vi.fn(() => {
    let mockState = {
      chartConfigs: [
        {
          key: "test-chart",
          interactiveFiltersConfig: {
            legend: { active: false, componentId: "test-component" },
            dataFilters: {
              active: false,
              componentIds: [],
              defaultValueOverrides: {},
            },
            timeRange: {
              active: false,
              componentId: "time-component",
              presets: {
                type: "range",
                from: "2021-01-01",
                to: "2021-12-31",
              },
            },
            calculation: { active: false, type: "identity" },
          },
        },
      ],
      activeChartKey: "test-chart",
    };
    mockDispatch = vi.fn((action) => {
      if (action.type === "INTERACTIVE_FILTER_CHANGED") {
        mockState.chartConfigs[0].interactiveFiltersConfig = action.value;
      }
    });
    return [mockState, mockDispatch];
  }),
}));

vi.mock("@/config-utils", () => ({
  getChartConfig: vi.fn(() => {
    const mockState = {
      chartConfigs: [
        {
          key: "test-chart",
          interactiveFiltersConfig: {
            legend: { active: false, componentId: "test-component" },
            dataFilters: {
              active: false,
              componentIds: [],
              defaultValueOverrides: {},
            },
            timeRange: {
              active: false,
              componentId: "time-component",
              presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
            },
            calculation: { active: false, type: "identity" },
          },
        },
      ],
      activeChartKey: "test-chart",
    };
    return mockState.chartConfigs[0];
  }),
  useChartConfigFilters: vi.fn(() => ({})),
}));

describe("Interactive Filters Config State", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("toggleInteractiveFilterDataDimension", () => {
    it("should add dimension to interactive data filters", () => {
      const initialConfig: InteractiveFiltersConfig = {
        legend: { active: false, componentId: "test-component" },
        dataFilters: {
          active: false,
          componentIds: [],
          defaultValueOverrides: {},
        },
        timeRange: {
          active: false,
          componentId: "time-component",
          presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
        },
        calculation: { active: false, type: "identity" },
      };

      const result = toggleInteractiveFilterDataDimension(
        initialConfig,
        "test-dimension"
      );

      expect(result.dataFilters.componentIds).toContain("test-dimension");
      expect(result.dataFilters.active).toBe(true);
    });

    it("should remove dimension from interactive data filters", () => {
      const initialConfig: InteractiveFiltersConfig = {
        legend: { active: false, componentId: "test-component" },
        dataFilters: {
          active: true,
          componentIds: ["test-dimension"],
          defaultValueOverrides: { "test-dimension": "default-value" },
        },
        timeRange: {
          active: false,
          componentId: "time-component",
          presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
        },
        calculation: { active: false, type: "identity" },
      };

      const result = toggleInteractiveFilterDataDimension(
        initialConfig,
        "test-dimension"
      );

      expect(result.dataFilters.componentIds).not.toContain("test-dimension");
      expect(result.dataFilters.active).toBe(false);
      expect(
        result.dataFilters.defaultValueOverrides["test-dimension"]
      ).toBeUndefined();
    });

    it("should force add dimension when newValue is true", () => {
      const initialConfig: InteractiveFiltersConfig = {
        legend: { active: false, componentId: "test-component" },
        dataFilters: {
          active: false,
          componentIds: [],
          defaultValueOverrides: {},
        },
        timeRange: {
          active: false,
          componentId: "time-component",
          presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
        },
        calculation: { active: false, type: "identity" },
      };

      const result = toggleInteractiveFilterDataDimension(
        initialConfig,
        "test-dimension",
        true
      );

      expect(result.dataFilters.componentIds).toContain("test-dimension");
      expect(result.dataFilters.active).toBe(true);
    });

    it("should force remove dimension when newValue is false", () => {
      const initialConfig: InteractiveFiltersConfig = {
        legend: { active: false, componentId: "test-component" },
        dataFilters: {
          active: true,
          componentIds: ["test-dimension"],
          defaultValueOverrides: { "test-dimension": "default-value" },
        },
        timeRange: {
          active: false,
          componentId: "time-component",
          presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
        },
        calculation: { active: false, type: "identity" },
      };

      const result = toggleInteractiveFilterDataDimension(
        initialConfig,
        "test-dimension",
        false
      );

      expect(result.dataFilters.componentIds).not.toContain("test-dimension");
      expect(result.dataFilters.active).toBe(false);
    });
  });

  describe("toggleInteractiveTimeRangeFilter", () => {
    it("should toggle time range filter from inactive to active", () => {
      const initialConfig: InteractiveFiltersConfig = {
        legend: { active: false, componentId: "test-component" },
        dataFilters: {
          active: false,
          componentIds: [],
          defaultValueOverrides: {},
        },
        timeRange: {
          active: false,
          componentId: "time-component",
          presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
        },
        calculation: { active: false, type: "identity" },
      };

      const result = initialConfig;
      result.timeRange.active = true;

      expect(result.timeRange.active).toBe(true);
    });

    it("should toggle time range filter from active to inactive", () => {
      const initialConfig: InteractiveFiltersConfig = {
        legend: { active: false, componentId: "test-component" },
        dataFilters: {
          active: false,
          componentIds: [],
          defaultValueOverrides: {},
        },
        timeRange: {
          active: true,
          componentId: "time-component",
          presets: { type: "range", from: "2021-01-01", to: "2021-12-31" },
        },
        calculation: { active: false, type: "identity" },
      };

      const result = initialConfig;
      result.timeRange.active = false;

      expect(result.timeRange.active).toBe(false);
    });
  });

  describe("useInteractiveDataFilterToggle", () => {
    it("should return toggle function and checked state", () => {
      const { result } = renderHook(() =>
        useInteractiveDataFilterToggle("test-dimension")
      );

      expect(result.current.name).toBe("dataFilters");
      expect(typeof result.current.onChange).toBe("function");
      expect(typeof result.current.checked).toBe("boolean");
    });
  });

  describe("useInteractiveTimeRangeToggle", () => {
    it("should return toggle function and checked state", () => {
      const { result } = renderHook(() => useInteractiveTimeRangeToggle());

      expect(typeof result.current.toggle).toBe("function");
      expect(typeof result.current.checked).toBe("boolean");
    });
  });

  describe("useDefaultValueOverride", () => {
    it("should return current value and onChange function", () => {
      const { result } = renderHook(() =>
        useDefaultValueOverride("test-dimension")
      );

      expect(result.current.value).toBe(FIELD_VALUE_NONE);
      expect(typeof result.current.onChange).toBe("function");
    });

    it("should handle change event", () => {
      const { result } = renderHook(() =>
        useDefaultValueOverride("test-dimension")
      );

      act(() => {
        result.current.onChange({
          target: { value: "new-value" },
        } as SelectChangeEvent<unknown>);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: expect.objectContaining({
          dataFilters: expect.objectContaining({
            defaultValueOverrides: expect.objectContaining({
              "test-dimension": "new-value",
            }),
          }),
        }),
      });
    });

    it("should handle FIELD_VALUE_NONE", () => {
      const { result } = renderHook(() =>
        useDefaultValueOverride("test-dimension")
      );

      act(() => {
        result.current.onChange({
          target: { value: FIELD_VALUE_NONE },
        } as SelectChangeEvent<unknown>);
      });

      expect(mockDispatch).toHaveBeenCalledWith({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: expect.objectContaining({
          dataFilters: expect.objectContaining({
            defaultValueOverrides: expect.not.objectContaining({
              "test-dimension": expect.anything(),
            }),
          }),
        }),
      });
    });
  });
});
