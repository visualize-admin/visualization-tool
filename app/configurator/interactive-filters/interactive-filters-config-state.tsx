import produce from "immer";
import get from "lodash/get";
import { useEffect } from "react";
import { ChangeEvent } from "react";

import {
  InteractiveDataFilterType,
  InteractiveFiltersConfig,
} from "@/config-types";
import { getChartConfig, useChartConfigFilters } from "@/config-utils";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useEvent } from "@/utils/use-event";

export const useInteractiveFiltersToggle = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    if (chartConfig.interactiveFiltersConfig.legend) {
      const newConfig = produce(
        chartConfig.interactiveFiltersConfig,
        (draft) => {
          draft.legend.active = e.currentTarget.checked;
        }
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newConfig,
      });
    }
  });

  const stateValue = get(chartConfig, "interactiveFiltersConfig.legend.active");
  const checked = stateValue ? stateValue : false;

  return {
    name: "legend",
    checked,
    onChange,
  };
};

/**
 * Toggles a single data filter
 */
export const useInteractiveDataFilterToggle = (
  dimensionId: string,
  filterType: InteractiveDataFilterType = "single"
) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onChange = useEvent(() => {
    const { interactiveFiltersConfig } = chartConfig;
    const newIFConfig = toggleInteractiveFilterDataDimension(
      interactiveFiltersConfig,
      dimensionId,
      undefined,
      filterType
    );

    dispatch({
      type: "INTERACTIVE_FILTER_CHANGED",
      value: newIFConfig,
    });
  });
  const checked =
    chartConfig.interactiveFiltersConfig.dataFilters.componentIds.includes(
      dimensionId
    );

  return {
    name: "dataFilters",
    checked,
    onChange,
  };
};

// Add or remove a dimension from the interactive  data filters dimensions list
export const toggleInteractiveFilterDataDimension = produce(
  (
    config: InteractiveFiltersConfig,
    id: string,
    newValue?: boolean,
    filterType?: InteractiveDataFilterType
  ): InteractiveFiltersConfig => {
    const currentComponentIds = config.dataFilters.componentIds;
    const shouldAdd =
      newValue === undefined ? !currentComponentIds.includes(id) : newValue;
    const newComponentIds = shouldAdd
      ? [...currentComponentIds, id]
      : config.dataFilters.componentIds.filter((d) => d !== id);

    const newDefaultValueOverrides = {
      ...config.dataFilters.defaultValueOverrides,
    };

    if (!shouldAdd) {
      delete newDefaultValueOverrides[id];
    }

    const newFilterTypes = { ...config.dataFilters.filterTypes };
    if (!shouldAdd) {
      delete newFilterTypes[id];
    } else if (filterType) {
      newFilterTypes[id] = filterType;
    }

    const newDataFilters: NonNullable<InteractiveFiltersConfig>["dataFilters"] =
      {
        ...config.dataFilters,
        componentIds: newComponentIds,
        defaultValueOverrides: newDefaultValueOverrides,
        filterTypes: newFilterTypes,
      };
    newDataFilters.active = newComponentIds.length > 0;

    return {
      ...config,
      dataFilters: newDataFilters,
    };
  }
);

/**
 * Toggles a time range filter
 */
export const useInteractiveTimeRangeToggle = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const toggle = useEvent(() => {
    const { interactiveFiltersConfig } = chartConfig;
    const newIFConfig = toggleInteractiveTimeRangeFilter(
      interactiveFiltersConfig
    );

    dispatch({
      type: "INTERACTIVE_FILTER_CHANGED",
      value: newIFConfig,
    });
  });
  const checked = chartConfig.interactiveFiltersConfig.timeRange.active;

  return { checked, toggle };
};

const toggleInteractiveTimeRangeFilter = (config: InteractiveFiltersConfig) => {
  if (!config?.timeRange) {
    return config;
  }

  const newTimeRange = {
    ...config.timeRange,
    active: !config.timeRange.active,
  };

  return { ...config, timeRange: newTimeRange };
};

export const useDefaultValueOverride = (dimensionId: string) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const filters = useChartConfigFilters(chartConfig);
  const currentValue =
    chartConfig.interactiveFiltersConfig.dataFilters.defaultValueOverrides[
      dimensionId
    ] ?? [];

  const onChange = useEvent((newValue: string[]) => {
    const newConfig = produce(chartConfig.interactiveFiltersConfig, (draft) => {
      if (newValue.length === 0) {
        delete draft.dataFilters.defaultValueOverrides[dimensionId];
      } else {
        draft.dataFilters.defaultValueOverrides[dimensionId] = newValue;
      }
    });

    dispatch({
      type: "INTERACTIVE_FILTER_CHANGED",
      value: newConfig,
    });
  });

  useEffect(() => {
    const f = filters[dimensionId];
    const override =
      chartConfig.interactiveFiltersConfig.dataFilters.defaultValueOverrides[
        dimensionId
      ];

    if (f?.type === "multi" && override && Array.isArray(override)) {
      const invalidValues = override.filter((v) => !f.values[v]);

      if (invalidValues.length > 0) {
        const validValues = override.filter((v) => f.values[v]);
        const newConfig = produce(
          chartConfig.interactiveFiltersConfig,
          (draft) => {
            if (validValues.length > 0) {
              draft.dataFilters.defaultValueOverrides[dimensionId] =
                validValues;
            } else {
              delete draft.dataFilters.defaultValueOverrides[dimensionId];
            }
          }
        );
        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newConfig,
        });
      }
    }
  }, [chartConfig.interactiveFiltersConfig, filters, dimensionId, dispatch]);

  return {
    value: currentValue,
    onChange,
  };
};
