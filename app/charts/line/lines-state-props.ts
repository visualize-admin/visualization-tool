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
  const { chartConfig, observations, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });
  const numericalYVariables = useNumericalYVariables(y, {
    measuresByIri,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsByIri,
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
  const { getX, getY, getSegmentAbbreviationOrLabel } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      getX,
    });
  }, [plottableData, getX]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate: getX,
    getSegmentAbbreviationOrLabel,
  });

  return {
    ...data,
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
