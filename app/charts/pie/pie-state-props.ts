import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  ChartStateData,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useChartData,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { PieConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

export type PieStateVariables = NumericalYVariables &
  SegmentVariables &
  RenderingVariables;

export const usePieStateVariables = (
  props: ChartProps<PieConfig> & { aspectRatio: number }
): PieStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields, filters, interactiveFiltersConfig } = chartConfig;
  const { y, segment, animation } = fields;

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
    ...numericalYVariables,
    ...segmentVariables,
    getRenderingKey,
  };
};

export const usePieStateData = (
  chartProps: ChartProps<PieConfig> & { aspectRatio: number },
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
    getSegmentAbbreviationOrLabel,
  });

  return {
    ...data,
    allData: plottableData,
  };
};
