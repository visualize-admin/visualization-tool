import produce from "immer";
import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";

import { InteractiveFiltersConfig, getChartConfig } from "@/config-types";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Dimension } from "@/domain/data";
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

export const useInteractiveTimeRangeFiltersToggle = ({
  timeExtent,
}: {
  timeExtent: [string, string];
}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const active = e.currentTarget.checked;

      if (timeExtent) {
        if (chartConfig.interactiveFiltersConfig?.timeRange) {
          const { from, to } =
            chartConfig.interactiveFiltersConfig.timeRange.presets;
          chartConfig.interactiveFiltersConfig.timeRange.active = active;

          // set min and max date as default presets for time brush
          if (active && !from && !to) {
            chartConfig.interactiveFiltersConfig.timeRange.presets.from =
              timeExtent[0];
            chartConfig.interactiveFiltersConfig.timeRange.presets.to =
              timeExtent[1];
          }
        }

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: chartConfig.interactiveFiltersConfig,
        });
      }
    },
    [chartConfig, timeExtent, dispatch]
  );

  const stateValue = get(
    chartConfig,
    `interactiveFiltersConfig.timeRange.active`
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: "timeRange",
    checked,
    onChange,
  };
};

export const updateInteractiveTimeRangeFilter = produce(
  (
    config: InteractiveFiltersConfig,
    { timeExtent: [from, to] }: { timeExtent: [string, string] }
  ): InteractiveFiltersConfig => {
    if (!config?.timeRange) {
      return config;
    }

    config.timeRange.presets.from = from;
    config.timeRange.presets.to = to;

    return config;
  }
);

/**
 * Toggles all data filters
 */
export const useInteractiveDataFiltersToggle = ({
  dimensions,
}: {
  dimensions: Dimension[];
}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const active = e.currentTarget.checked;

      const newConfig = produce(
        chartConfig.interactiveFiltersConfig,
        (draft) => {
          if (draft?.dataFilters) {
            draft.dataFilters.active = active;

            // Default: toggle dimensions if none is selected, but they are set to true
            if (active && draft.dataFilters.componentIris.length === 0) {
              draft.dataFilters.componentIris = dimensions.map((d) => d.iri);
            }
          }

          return draft;
        }
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newConfig,
      });
    },
    [chartConfig, dimensions, dispatch]
  );

  const stateValue = get(
    state,
    "chartConfig.interactiveFiltersConfig.dataFilters.active"
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: "dataFilters",
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
