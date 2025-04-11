import { ascending } from "d3-array";
import { useCallback, useMemo } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  LimitsVariables,
  NumericalYErrorVariables,
  NumericalYVariables,
  SegmentVariables,
  SortingVariables,
  TemporalXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useLimitsVariables,
  useNumericalYErrorVariables,
  useNumericalYVariables,
  useSegmentVariables,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { useLimits } from "@/config-utils";
import { LineConfig } from "@/configurator";

import { ChartProps } from "../shared/ChartProps";

export type LinesStateVariables = BaseVariables &
  SortingVariables &
  TemporalXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  SegmentVariables &
  InteractiveFiltersVariables &
  LimitsVariables;

export const useLinesStateVariables = (
  props: ChartProps<LineConfig> & { limits: ReturnType<typeof useLimits> }
): LinesStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measures,
    measuresById,
    limits,
  } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsById,
  });
  const numericalYVariables = useNumericalYVariables("line", y, {
    measuresById,
  });
  const numericalYErrorVariables = useNumericalYErrorVariables(y, {
    getValue: numericalYVariables.getY,
    dimensions,
    measures,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsById,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    chartConfig.interactiveFiltersConfig,
    { dimensionsById }
  );
  const limitsVariables = useLimitsVariables(limits);

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
    ...numericalYErrorVariables,
    ...segmentVariables,
    ...interactiveFiltersVariables,
    ...limitsVariables,
  };
};

export const useLinesStateData = (
  chartProps: ChartProps<LineConfig>,
  variables: LinesStateVariables
): ChartStateData => {
  const { chartConfig, dimensions, observations } = chartProps;
  const {
    sortData,
    xDimension,
    getX,
    getY,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });

  return useChartData(plottableData, {
    sortData,
    chartConfig,
    dimensions,
    timeRangeDimensionId: xDimension.id,
    getAxisValueAsDate: getX,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });
};
