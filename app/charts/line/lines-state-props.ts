import { ascending } from "d3";
import React from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  ChartStateData,
  NumericalYVariables,
  SegmentVariables,
  TemporalXVariables,
  useChartData,
  useNumericalYVariables,
  useSegmentVariables,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { LineConfig } from "@/configurator";
import { Observation } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type LinesStateVariables = TemporalXVariables &
  NumericalYVariables &
  SegmentVariables;

export const useLinesStateVariables = (
  props: ChartProps<LineConfig> & { aspectRatio: number }
): LinesStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const temporalXVariables = useTemporalXVariables(x, {
    dimensions,
  });
  const numericalYVariables = useNumericalYVariables(y, {
    measures,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensions,
    observations,
  });

  return {
    ...temporalXVariables,
    ...numericalYVariables,
    ...segmentVariables,
  };
};

// TODO: same as Area chart, useTemporalXData, except for plottable data deps.
// Check if getX shouldn't be included here.
export const useLinesStateData = (
  chartProps: ChartProps<LineConfig> & { aspectRatio: number },
  variables: LinesStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, getY, getSegment } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      getX,
    });
  }, [plottableData, getX]);
  const { chartData, scalesData, segmentData } = useChartData(
    sortedPlottableData,
    {
      chartConfig,
      getXAsDate: getX,
      getSegment,
    }
  );

  return {
    chartData,
    scalesData,
    segmentData,
    allData: sortedPlottableData,
  };
};

// TODO: same as Area chart. sortTemporalData?
const sortData = (
  data: Observation[],
  { getX }: Pick<LinesStateVariables, "getX">
): Observation[] => {
  return [...data].sort((a, b) => {
    return ascending(getX(a), getX(b));
  });
};
