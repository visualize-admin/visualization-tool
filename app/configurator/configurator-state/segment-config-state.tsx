import get from "lodash/get";
import { ChangeEvent } from "react";

import { isSegmentInConfig } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { isConfiguring } from "@/configurator/configurator-state";
import { useConfiguratorState } from "@/src";
import { useEvent } from "@/utils/use-event";

export const useLegendTitleVisibility = () => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const onChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    if (isSegmentInConfig(chartConfig)) {
      dispatch({
        type: "CHART_SHOW_LEGEND_TITLE_CHANGED",
        value: e.currentTarget.checked,
      });
    }
  });

  const stateValue = get(chartConfig, `fields.segment.showTitle`);
  const checked = stateValue ? stateValue : false;

  return {
    name: "showTitle",
    checked,
    onChange,
  };
};
