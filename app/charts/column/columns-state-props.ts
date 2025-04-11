import { ascending, descending } from "d3-array";
import { useCallback } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  LimitsVariables,
  NumericalYErrorVariables,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  SortingVariables,
  useBandXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useLimitsVariables,
  useNumericalYErrorVariables,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters, useLimits } from "@/config-utils";
import { ColumnConfig } from "@/configurator";
import { isTemporalEntityDimension } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsStateVariables = BaseVariables &
  SortingVariables &
  BandXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  SegmentVariables &
  RenderingVariables &
  InteractiveFiltersVariables &
  LimitsVariables;

export const useColumnsStateVariables = (
  props: ChartProps<ColumnConfig> & { limits: ReturnType<typeof useLimits> }
): ColumnsStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measures,
    measuresById,
    limits,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, animation } = fields;
  const xDimension = dimensionsById[x.componentId];
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const bandXVariables = useBandXVariables(x, {
    dimensionsById,
    observations,
  });
  const numericalYVariables = useNumericalYVariables("column", y, {
    measuresById,
  });
  const numericalYErrorVariables = useNumericalYErrorVariables(y, {
    getValue: numericalYVariables.getY,
    dimensions,
    measures,
  });
  const segmentVariables = useSegmentVariables(undefined, {
    dimensionsById,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    interactiveFiltersConfig,
    { dimensionsById }
  );
  const limitsVariables = useLimitsVariables(limits);

  const { getX, getXAsDate } = bandXVariables;
  const { getY } = numericalYVariables;
  const sortData: ColumnsStateVariables["sortData"] = useCallback(
    (data) => {
      const { sortingOrder, sortingType } = x.sorting ?? {};
      const xGetter = isTemporalEntityDimension(xDimension) ? getXAsDate : getX;
      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(xGetter(a), xGetter(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(xGetter(a), xGetter(b)));
      } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
        return [...data].sort((a, b) =>
          descending(getY(a) ?? -1, getY(b) ?? -1)
        );
      } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
        return [...data].sort((a, b) =>
          ascending(getY(a) ?? -1, getY(b) ?? -1)
        );
      } else {
        return [...data].sort((a, b) => ascending(xGetter(a), xGetter(b)));
      }
    },
    [getX, getXAsDate, getY, x.sorting, xDimension]
  );

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    ...baseVariables,
    sortData,
    ...bandXVariables,
    ...numericalYVariables,
    ...numericalYErrorVariables,
    ...segmentVariables,
    ...interactiveFiltersVariables,
    ...limitsVariables,
    getRenderingKey,
  };
};

export const useColumnsStateData = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsStateVariables
): ChartStateData => {
  const { chartConfig, dimensions, observations } = chartProps;
  const { sortData, xDimension, getXAsDate, getY, getTimeRangeDate } =
    variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });

  return useChartData(plottableData, {
    sortData,
    chartConfig,
    dimensions,
    timeRangeDimensionId: xDimension.id,
    getAxisValueAsDate: getXAsDate,
    getTimeRangeDate,
  });
};
