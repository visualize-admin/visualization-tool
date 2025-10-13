import { ascending, descending, group } from "d3-array";
import { useCallback, useMemo } from "react";

import { getWideData, usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  SortingVariables,
  useBandXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters } from "@/config-utils";
import { ColumnConfig } from "@/configurator";
import { isTemporalEntityDimension, Observation } from "@/domain/data";
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/chart-props";

export type ColumnsStackedStateVariables = BaseVariables &
  SortingVariables<{ plottableDataWide: Observation[] }> &
  BandXVariables &
  NumericalYVariables &
  SegmentVariables &
  RenderingVariables &
  InteractiveFiltersVariables;

export const useColumnsStackedStateVariables = (
  props: ChartProps<ColumnConfig>
): ColumnsStackedStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measuresById,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;
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
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsById,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    interactiveFiltersConfig,
    { dimensionsById }
  );

  const { getX, getXAsDate } = bandXVariables;
  const sortData: ColumnsStackedStateVariables["sortData"] = useCallback(
    (data, { plottableDataWide }) => {
      const { sortingOrder, sortingType } = x.sorting ?? {};
      const xGetter = isTemporalEntityDimension(xDimension)
        ? (d: Observation) => getXAsDate(d).getTime().toString()
        : getX;
      const xOrder = plottableDataWide
        .sort((a, b) => ascending(a.total ?? undefined, b.total ?? undefined))
        .map(xGetter);

      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(xGetter(a), xGetter(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(xGetter(a), xGetter(b)));
      } else if (sortingType === "byMeasure") {
        return sortByIndex({
          data,
          order: xOrder,
          getCategory: xGetter,
          sortingOrder,
        });
      } else {
        return [...data].sort((a, b) => ascending(xGetter(a), xGetter(b)));
      }
    },
    [getX, getXAsDate, x.sorting, xDimension]
  );

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    animation
  );

  return {
    ...baseVariables,
    sortData,
    ...bandXVariables,
    ...numericalYVariables,
    ...segmentVariables,
    ...interactiveFiltersVariables,
    getRenderingKey,
  };
};

export type ColumnsStackedStateData = ChartStateData & {
  plottableDataWide: Observation[];
};

export const useColumnsStackedStateData = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsStackedStateVariables
): ColumnsStackedStateData => {
  const { chartConfig, observations } = chartProps;
  const { fields } = chartConfig;
  const { x } = fields;
  const {
    sortData,
    xDimension,
    getX,
    getXAsDate,
    getY,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const plottableDataWide = useMemo(() => {
    const plottableDataByX = group(plottableData, getX);

    return getWideData({
      dataGrouped: plottableDataByX,
      key: x.componentId,
      getAxisValue: getY,
      getSegment,
    });
  }, [plottableData, getX, x.componentId, getY, getSegment]);
  const sortPlottableData = useCallback(
    (data: Observation[]) => {
      return sortData(data, { plottableDataWide });
    },
    [plottableDataWide, sortData]
  );
  const data = useChartData(plottableData, {
    sortData: sortPlottableData,
    chartConfig,
    timeRangeDimensionId: xDimension.id,
    getAxisValueAsDate: getXAsDate,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });

  return {
    ...data,
    plottableDataWide,
  };
};
