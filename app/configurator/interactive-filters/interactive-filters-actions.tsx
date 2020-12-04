import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";
import { useConfiguratorState } from "../configurator-state";
import { InteractveFilterType } from "./interactive-filters-configurator";
import {
  toggleInteractiveFilter,
  toggleInteractiveFilterDataDimension,
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

// Checkbox to remove from filters, add to interactive dataFilters
// init with value selected in config filter
export const useInteractiveDataFilterDimensionToggle = () => {
  const [state, dispatch] = useConfiguratorState();
  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      console.log(e.currentTarget.value);
      if (
        state.state === "DESCRIBING_CHART" &&
        // All charts except "table" can have interactive filters
        state.chartConfig.chartType !== "table"
      ) {
        const newIFConfig = toggleInteractiveFilterDataDimension(
          state.chartConfig.interactiveFiltersConfig,
          e.currentTarget.value
        );
        console.log("newIFConfig", newIFConfig);
        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newIFConfig,
        });
      }
    },
    [dispatch, state]
  );
  // const stateValue =state.  .interactiveFiltersConfig.dataFilters.componentIris.inclu
  // state.state === "DESCRIBING_CHART"
  //   ? get(state, `chartConfig.interactiveFiltersConfig.dataFilters.componentIris`, "")
  //   : "";

  // const checked = stateValue ? stateValue : false;
  return {
    name: "dataFilters",
    checked: true,
    onChange,
  };
};
