import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  NumericalXVariables,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useBaseVariables,
  useChartData,
  useNumericalXVariables,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters } from "@/config-utils";
import { ScatterPlotConfig } from "@/configurator";

import { ChartProps } from "../shared/chart-props";

export type ScatterplotStateVariables = BaseVariables &
  NumericalXVariables &
  NumericalYVariables &
  SegmentVariables &
  RenderingVariables;

export const useScatterplotStateVariables = (
  props: ChartProps<ScatterPlotConfig>
): ScatterplotStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measuresById,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const numericalXVariables = useNumericalXVariables("scatterplot", x, {
    measuresById,
  });
  const numericalYVariables = useNumericalYVariables("scatterplot", y, {
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
    ...numericalXVariables,
    ...numericalYVariables,
    ...segmentVariables,
    getRenderingKey,
  };
};

export const useScatterplotStateData = (
  chartProps: ChartProps<ScatterPlotConfig>,
  variables: ScatterplotStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, getY, getSegmentAbbreviationOrLabel } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
    getY,
  });

  return useChartData(plottableData, {
    chartConfig,
    timeRangeDimensionId: undefined,
    getSegmentAbbreviationOrLabel,
  });
};
