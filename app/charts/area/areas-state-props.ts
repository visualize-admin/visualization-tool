import { ascending } from "d3";
import React from "react";

import { ChartProps } from "@/charts/shared/ChartProps";
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
import { AreaConfig } from "@/config-types";
import { Observation } from "@/domain/data";

export type AreasStateVariables = TemporalXVariables &
  NumericalYVariables &
  SegmentVariables;

export const useAreasStateVariables = (
  props: ChartProps<AreaConfig> & { aspectRatio: number }
): AreasStateVariables => {
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

export const useAreasStateData = (
  chartProps: ChartProps<AreaConfig> & { aspectRatio: number },
  variables: AreasStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, getY, getSegmentAbbreviationOrLabel } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
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

const sortData = (
  data: Observation[],
  { getX }: Pick<AreasStateVariables, "getX">
): Observation[] => {
  return [...data].sort((a, b) => {
    return ascending(getX(a), getX(b));
  });
};
