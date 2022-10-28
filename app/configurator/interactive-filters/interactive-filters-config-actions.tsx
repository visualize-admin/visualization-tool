import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";

import {
  isDescribing,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import {
  toggleInteractiveDataFilter,
  toggleInteractiveFilter,
  toggleInteractiveTimeRangeFilter,
} from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";

export const useInteractiveFiltersToggle = ({
  path,
}: {
  path: InteractiveFilterType;
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const newIFConfig = toggleInteractiveFilter(
        state.chartConfig.interactiveFiltersConfig,
        { path, value: e.currentTarget.checked }
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newIFConfig,
      });
    },
    [dispatch, path, state]
  );

  const stateValue = get(
    state,
    `chartConfig.interactiveFiltersConfig.${path}.active`,
    ""
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: path,
    checked,
    onChange,
  };
};

export const useInteractiveTimeRangeFiltersToggle = ({
  path,
  timeExtent,
}: {
  path: "timeRange";
  timeExtent: string[];
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);
  const { chartConfig } = state;

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (timeExtent) {
        const newIFConfig = toggleInteractiveTimeRangeFilter(
          chartConfig.interactiveFiltersConfig,
          { path, value: e.currentTarget.checked, timeExtent }
        );

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newIFConfig,
        });
      }
    },
    [chartConfig, path, timeExtent, dispatch]
  );

  const stateValue = get(
    state,
    `chartConfig.interactiveFiltersConfig.${path}.active`,
    ""
  );
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
  dimensions: DimensionMetadataFragment[];
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);
  const { chartConfig } = state;

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const newIFConfig = toggleInteractiveDataFilter(
        chartConfig.interactiveFiltersConfig,
        { path, value: e.currentTarget.checked, dimensions }
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newIFConfig,
      });
    },
    [chartConfig, path, dimensions, dispatch]
  );

  const stateValue = get(
    state,
    `chartConfig.interactiveFiltersConfig.${path}.active`,
    ""
  );
  const checked = stateValue ? stateValue : false;

  return {
    name: path,
    checked,
    onChange,
  };
};
