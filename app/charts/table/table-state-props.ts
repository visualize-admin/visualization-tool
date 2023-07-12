import { usePlottableData } from "@/charts/shared/chart-helpers";
import { ChartStateData, useChartData } from "@/charts/shared/chart-state";
import { TableConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

export const useTableStateData = (
  chartProps: ChartProps<TableConfig>
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  // No need to sort the data for table.
  const plottableData = usePlottableData(observations, {});
  const data = useChartData(plottableData, {
    chartConfig,
  });

  return {
    ...data,
    allData: plottableData,
  };
};
