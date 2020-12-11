import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";
import { ComponentFieldsFragment } from "../../graphql/query-hooks";
import { ConfiguratorStateDescribingChart } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { InteractveFilterType } from "./interactive-filters-configurator";
import {
  toggleInteractiveDataFilter,
  toggleInteractiveFilter,
} from "./interactive-filters-state";

export const useInteractiveFiltersToggle = ({
  path,
}: {
  path: InteractveFilterType;
}) => {
  const [state, dispatch] = useConfiguratorState();
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (
        state.state === "DESCRIBING_CHART" &&
        // All charts except "table" can have interactive filters
        state.chartConfig.chartType !== "table"
      ) {
        const newIFConfig = toggleInteractiveFilter(
          state.chartConfig.interactiveFiltersConfig,
          { path, value: e.currentTarget.checked }
        );

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newIFConfig,
        });
      }
    },
    [dispatch, path, state]
  );
  const stateValue =
    state.state === "DESCRIBING_CHART"
      ? get(state, `chartConfig.interactiveFiltersConfig.${path}.active`, "")
      : "";

  const checked = stateValue ? stateValue : false;
  return {
    name: path,
    checked,
    onChange,
  };
};

export const useInteractiveTimeFiltersToggle = ({
  path,
  timeExtent,
}: {
  path: "time";
  timeExtent: string[];
}) => {
  const [state, dispatch] = useConfiguratorState();

  const { chartConfig } = state as ConfiguratorStateDescribingChart;
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (timeExtent && state.state === "DESCRIBING_CHART") {
        const newIFConfig = toggleInteractiveTimeFilter(
          chartConfig.interactiveFiltersConfig,
          { path, value: e.currentTarget.checked, timeExtent }
        );

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newIFConfig,
        });
      }
    },
    [state, chartConfig, path, timeExtent, dispatch]
  );
  const stateValue =
    state.state === "DESCRIBING_CHART"
      ? get(state, `chartConfig.interactiveFiltersConfig.${path}.active`, "")
      : "";

  const checked = stateValue ? stateValue : false;
  return {
    name: path,
    checked,
    onChange,
  };
};

export const useInteractiveDataFiltersToggle = ({
  path,
  dimensions,
}: {
  path: "dataFilters";
  dimensions: ComponentFieldsFragment[];
}) => {
  const [state, dispatch] = useConfiguratorState();

  const { chartConfig } = state as ConfiguratorStateDescribingChart;
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (
        state.state === "DESCRIBING_CHART" &&
        // All charts except "table" can have interactive filters
        chartConfig.chartType !== "table"
      ) {
        const newIFConfig = toggleInteractiveDataFilter(
          chartConfig.interactiveFiltersConfig,
          { path, value: e.currentTarget.checked, dimensions }
        );

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newIFConfig,
        });
      }
    },
    [state, chartConfig, path, dimensions, dispatch]
  );
  const stateValue =
    state.state === "DESCRIBING_CHART"
      ? get(state, `chartConfig.interactiveFiltersConfig.${path}.active`, "")
      : "";

  const checked = stateValue ? stateValue : false;
  return {
    name: path,
    checked,
    onChange,
  };
};
