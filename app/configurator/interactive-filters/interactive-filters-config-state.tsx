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
export const useInteractiveDataFilterToggle = (dimensionIri: string) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const toggle = useEvent(() => {
    const { interactiveFiltersConfig } = chartConfig;
    const newIFConfig = toggleInteractiveFilterDataDimension(
      interactiveFiltersConfig,
      dimensionIri
    );

    dispatch({
      type: "INTERACTIVE_FILTER_CHANGED",
      value: newIFConfig,
    });
  });
  const checked =
    chartConfig.interactiveFiltersConfig?.dataFilters.componentIris?.includes(
      dimensionIri
    );

  return { checked, toggle };
};

// Add or remove a dimension from the interactive
// data filters dimensions list
export const toggleInteractiveFilterDataDimension = produce(
  (
    config: InteractiveFiltersConfig,
    iri: string,
    newValue?: boolean
  ): InteractiveFiltersConfig => {
    if (!config?.dataFilters.componentIris) {
      return config;
    }

    const currentComponentIris = config.dataFilters.componentIris;
    const shouldAdd =
      newValue === undefined ? !currentComponentIris.includes(iri) : newValue;
    const newComponentIris = shouldAdd
      ? [...currentComponentIris, iri]
      : config.dataFilters.componentIris.filter((d) => d !== iri);
    const newDataFilters = {
      ...config.dataFilters,
      componentIris: newComponentIris,
    };
    newDataFilters.active = newComponentIris.length > 0;
    return { ...config, dataFilters: newDataFilters };
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
