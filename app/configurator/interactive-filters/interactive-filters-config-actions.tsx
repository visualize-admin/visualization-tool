import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";
import { DimensionMetaDataFragment } from "@/graphql/query-hooks";
import { ConfiguratorStateDescribingChart } from "@/configurator/config-types";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import {
  toggleInteractiveDataFilter,
  toggleInteractiveFilter,
  toggleInteractiveTimeFilter,
} from "@/configurator/interactive-filters/interactive-filters-config-state";

export const useInteractiveFiltersToggle = ({
  path,
}: {
  path: InteractiveFilterType;
}) => {
  const [state, dispatch] = useConfiguratorState();
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (state.state === "DESCRIBING_CHART") {
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
  dimensions: DimensionMetaDataFragment[];
}) => {
  const [state, dispatch] = useConfiguratorState();

  const { chartConfig } = state as ConfiguratorStateDescribingChart;
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (state.state === "DESCRIBING_CHART") {
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
