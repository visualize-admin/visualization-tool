import { ascending } from "d3-array";
import { useCallback, useMemo } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  LimitsVariables,
  NumericalYVariables,
  SegmentVariables,
  SortingVariables,
  TemporalXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useLimitsVariables,
  useNumericalYVariables,
  useSegmentVariables,
  useTemporalXVariables,
} from "@/charts/shared/chart-state";
import { ChartProps } from "@/charts/shared/ChartProps";
import { AreaConfig } from "@/config-types";
import { useLimits } from "@/config-utils";

export type AreasStateVariables = BaseVariables &
  SortingVariables &
  TemporalXVariables &
  NumericalYVariables &
  SegmentVariables &
  InteractiveFiltersVariables &
  LimitsVariables;

export const useAreasStateVariables = (
  props: ChartProps<AreaConfig> & { limits: ReturnType<typeof useLimits> }
): AreasStateVariables => {
  const { chartConfig, observations, dimensionsById, measuresById, limits } =
    props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsById,
  });
  const numericalYVariables = useNumericalYVariables("area", y, {
    measuresById,
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
  const sortData: AreasStateVariables["sortData"] = useCallback(
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
    ...limitsVariables,
  };
};

export const useAreasStateData = (
  chartProps: ChartProps<AreaConfig>,
  variables: AreasStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const {
    sortData,
    xDimension,
    getX,
    getY,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
    getY,
  });
  const sortedPlottableData = useMemo(() => {
    return sortData(plottableData);
  }, [sortData, plottableData]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    timeRangeDimensionId: xDimension.id,
    getAxisValueAsDate: getX,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
