import produce from "immer";
import get from "lodash/get";
import { ChangeEvent } from "react";

import { InteractiveFiltersConfig } from "@/config-types";
import { getChartConfig } from "@/config-utils";
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
export const useInteractiveDataFilterToggle = (dimensionId: string) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onChange = useEvent(() => {
    const { interactiveFiltersConfig } = chartConfig;
    const newIFConfig = toggleInteractiveFilterDataDimension(
      interactiveFiltersConfig,
      dimensionId
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
    newValue?: boolean
  ): InteractiveFiltersConfig => {
    const currentComponentIds = config.dataFilters.componentIds;
    const shouldAdd =
      newValue === undefined ? !currentComponentIds.includes(id) : newValue;
    const newComponentIds = shouldAdd
      ? [...currentComponentIds, id]
      : config.dataFilters.componentIds.filter((d) => d !== id);
    const newDataFilters: NonNullable<InteractiveFiltersConfig>["dataFilters"] =
      {
        ...config.dataFilters,
        componentIds: newComponentIds,
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
