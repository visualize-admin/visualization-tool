import produce from "immer";
import get from "lodash/get";
import { ChangeEvent } from "react";

import { getChartConfig, InteractiveFiltersConfig } from "@/config-types";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import useEvent from "@/utils/use-event";

export const useInteractiveFiltersToggle = (target: "legend") => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    if (chartConfig.interactiveFiltersConfig?.[target]) {
      const newConfig = produce(
        chartConfig.interactiveFiltersConfig,
        (draft) => {
          draft[target].active = e.currentTarget.checked;
        }
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newConfig,
      });
    }
  });

  const stateValue = get(
    chartConfig,
    `interactiveFiltersConfig.${target}.active`
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: target,
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
  const toggle = useEvent(() => {
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
    chartConfig.interactiveFiltersConfig?.dataFilters.componentIds?.includes(
      dimensionId
    );

  return { checked, toggle };
};

// Add or remove a dimension from the interactive  data filters dimensions list
export const toggleInteractiveFilterDataDimension = produce(
  (
    config: InteractiveFiltersConfig,
    id: string,
    newValue?: boolean
  ): InteractiveFiltersConfig => {
    if (!config?.dataFilters.componentIds) {
      return config;
    }

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
  const checked = chartConfig.interactiveFiltersConfig?.timeRange.active;

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
