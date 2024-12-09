import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useBaseVariables,
  useChartData,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { PieConfig, useChartConfigFilters } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

export type PieStateVariables = BaseVariables &
  NumericalYVariables &
  SegmentVariables &
  RenderingVariables;

export const usePieStateVariables = (
  props: ChartProps<PieConfig>
): PieStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measuresById,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { y, segment, animation } = fields;
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const numericalYVariables = useNumericalYVariables("pie", y, {
    measuresById,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsById,
    observations,
  });

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    ...baseVariables,
    ...numericalYVariables,
    ...segmentVariables,
    getRenderingKey,
  };
};

export const usePieStateData = (
  chartProps: ChartProps<PieConfig>,
  variables: PieStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getY, getSegmentAbbreviationOrLabel } = variables;
  // No need to sort the data for pie.
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const data = useChartData(plottableData, {
    chartConfig,
    timeRangeDimensionId: undefined,
    getSegmentAbbreviationOrLabel,
  });

  return {
    ...data,
    allData: plottableData,
  };
};
