import get from "lodash/get";
import { ChangeEvent, useCallback } from "react";
import { useConfiguratorState } from "../configurator-state";
import { toggleInteractiveFilter } from "./interactive-filters-state";

export const useInteractiveFiltersToggle = ({
  path,
}: {
  path: "legend" | "time";
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
          state.chartConfig.interactiveFilters,
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
      ? get(state, `chartConfig.interactiveFilters.${path}.active`, "")
      : "";

  const checked = stateValue ? stateValue : false;
  return {
    name: path,
    checked,
    onChange,
  };
};
