import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  ChartStateData,
  NumericalXVariables,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useChartData,
  useNumericalXVariables,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { ScatterPlotConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

export type ScatterplotStateVariables = NumericalXVariables &
  NumericalYVariables &
  SegmentVariables &
  RenderingVariables;

export const useScatterplotStateVariables = (
  props: ChartProps<ScatterPlotConfig> & { aspectRatio: number }
): ScatterplotStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields, filters, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;

  const numericalXVariables = useNumericalXVariables(x, {
    measures,
  });
  const numericalYVariables = useNumericalYVariables(y, {
    measures,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensions,
    observations,
  });

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    ...numericalXVariables,
    ...numericalYVariables,
    ...segmentVariables,
    getRenderingKey,
  };
};

export const useScatterplotStateData = (
  chartProps: ChartProps<ScatterPlotConfig> & { aspectRatio: number },
  variables: ScatterplotStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, getY, getSegment } = variables;
  // No need to sort the data for pie.
  const plottableData = usePlottableData(observations, {
    getX,
    getY,
  });
  const data = useChartData(plottableData, {
    chartConfig,
    getSegment,
  });

  return {
    ...data,
    allData: plottableData,
  };
};
