import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  TemporalMaybeXVariables,
  useBaseVariables,
  useChartData,
  useTemporalMaybeXVariables,
} from "@/charts/shared/chart-state";
import { TableConfig } from "@/configurator";

import { ChartProps } from "../shared/chart-props";

export type TableStateVariables = BaseVariables & TemporalMaybeXVariables;

export const useTableStateVariables = (
  props: ChartProps<TableConfig>
): TableStateVariables => {
  const { chartConfig, dimensionsById } = props;

  const baseVariables = useBaseVariables(chartConfig);

  const { timeRange } = chartConfig.interactiveFiltersConfig;
  const timeRangeDimensionId = timeRange.active
    ? timeRange.componentId
    : undefined;
  const temporalMaybeXVariables = useTemporalMaybeXVariables(
    { componentId: timeRangeDimensionId },
    { dimensionsById }
  );

  return { ...baseVariables, ...temporalMaybeXVariables };
};

export const useTableStateData = (
  chartProps: ChartProps<TableConfig>,
  variables: TableStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { xDimension, getX } = variables;
  const plottableData = usePlottableData(observations, {});

  return useChartData(plottableData, {
    chartConfig,
    timeRangeDimensionId: xDimension?.id,
    axisDimensionId: xDimension?.id,
    getAxisValueAsDate: getX,
    getTimeRangeDate: getX,
  });
};
