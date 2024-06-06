import { ascending } from "d3-array";
import { useCallback, useMemo } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  NumericalYVariables,
  SegmentVariables,
  SortingVariables,
  TemporalXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useNumericalYVariables,
  useSegmentVariables,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { LineConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

export type LinesStateVariables = BaseVariables &
  SortingVariables &
  TemporalXVariables &
  NumericalYVariables &
  SegmentVariables &
  InteractiveFiltersVariables;

export const useLinesStateVariables = (
  props: ChartProps<LineConfig>
): LinesStateVariables => {
  const { chartConfig, observations, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });
  const numericalYVariables = useNumericalYVariables("line", y, {
    measuresByIri,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsByIri,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    chartConfig.interactiveFiltersConfig,
    { dimensionsByIri }
  );

  const { getX } = temporalXVariables;
  const sortData: LinesStateVariables["sortData"] = useCallback(
    (data) => {
      return [...data].sort((a, b) => {
        return ascending(getX(a), getX(b));
      });
    },
    [getX]
  );

  return {
    ...baseVariables,
    sortData,
    ...temporalXVariables,
    ...numericalYVariables,
    ...segmentVariables,
    ...interactiveFiltersVariables,
  };
};

// TODO: same as Area chart, useTemporalXData, except for plottable data deps.
// Check if getX shouldn't be included here.
export const useLinesStateData = (
  chartProps: ChartProps<LineConfig>,
  variables: LinesStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const {
    sortData,
    getX,
    getY,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const sortedPlottableData = useMemo(() => {
    return sortData(plottableData);
  }, [sortData, plottableData]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate: getX,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
