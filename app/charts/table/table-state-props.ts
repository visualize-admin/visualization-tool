import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  useBaseVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { TableConfig } from "@/configurator";

import { ChartProps } from "../shared/chart-props";

export type TableStateVariables = BaseVariables;

export const useTableStateVariables = (
  props: ChartProps<TableConfig>
): TableStateVariables => {
  const { chartConfig } = props;

  const baseVariables = useBaseVariables(chartConfig);

  return baseVariables;
};

export const useTableStateData = (
  chartProps: ChartProps<TableConfig>
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const plottableData = usePlottableData(observations, {});

  return useChartData(plottableData, {
    chartConfig,
    timeRangeDimensionId: undefined,
  });
};
