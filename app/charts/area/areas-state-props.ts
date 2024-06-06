import { ascending } from "d3-array";
import { useCallback, useMemo } from "react";

import { ChartProps } from "@/charts/shared/ChartProps";
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
import { AreaConfig } from "@/config-types";

export type AreasStateVariables = BaseVariables &
  SortingVariables &
  TemporalXVariables &
  NumericalYVariables &
  SegmentVariables &
  InteractiveFiltersVariables;

export const useAreasStateVariables = (
  props: ChartProps<AreaConfig>
): AreasStateVariables => {
  const { chartConfig, observations, dimensionsByIri, measuresByIri } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const baseVariables = useBaseVariables(chartConfig);
  const temporalXVariables = useTemporalXVariables(x, {
    dimensionsByIri,
  });
  const numericalYVariables = useNumericalYVariables("area", y, {
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
  };
};

export const useAreasStateData = (
  chartProps: ChartProps<AreaConfig>,
  variables: AreasStateVariables
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
    getX,
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
