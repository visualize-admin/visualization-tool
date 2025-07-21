import { ascending, descending, group } from "d3-array";
import { useCallback, useMemo } from "react";

import { getWideData, usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandYVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  NumericalXVariables,
  RenderingVariables,
  SegmentVariables,
  SortingVariables,
  useBandYVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useNumericalXVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters } from "@/config-utils";
import { BarConfig } from "@/configurator";
import { isTemporalEntityDimension, Observation } from "@/domain/data";
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/chart-props";

export type BarsStackedStateVariables = BaseVariables &
  SortingVariables<{ plottableDataWide: Observation[] }> &
  BandYVariables &
  NumericalXVariables &
  SegmentVariables &
  RenderingVariables &
  InteractiveFiltersVariables;

export const useBarsStackedStateVariables = (
  props: ChartProps<BarConfig>
): BarsStackedStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measuresById,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;
  const yDimension = dimensionsById[y.componentId];
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const numericalXVariables = useNumericalXVariables("bar", x, {
    measuresById,
  });
  const bandYVariables = useBandYVariables(y, {
    dimensionsById,
    observations,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsById,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    interactiveFiltersConfig,
    { dimensionsById }
  );

  const { getY, getYAsDate } = bandYVariables;
  const sortData: BarsStackedStateVariables["sortData"] = useCallback(
    (data, { plottableDataWide }) => {
      const { sortingOrder, sortingType } = y.sorting ?? {};
      const yGetter = isTemporalEntityDimension(yDimension)
        ? (d: Observation) => getYAsDate(d).getTime().toString()
        : getY;
      const yOrder = plottableDataWide
        .sort((a, b) => ascending(a.total ?? undefined, b.total ?? undefined))
        .map(yGetter);

      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(yGetter(a), yGetter(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(yGetter(a), yGetter(b)));
      } else if (sortingType === "byMeasure") {
        return sortByIndex({
          data,
          order: yOrder,
          getCategory: yGetter,
          sortingOrder,
        });
      } else {
        return [...data].sort((a, b) => ascending(yGetter(a), yGetter(b)));
      }
    },
    [getY, getYAsDate, y.sorting, yDimension]
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
    ...bandYVariables,
    ...numericalXVariables,
    ...segmentVariables,
    ...interactiveFiltersVariables,
    getRenderingKey,
  };
};

export type BarsStackedStateData = ChartStateData & {
  plottableDataWide: Observation[];
};

export const useBarsStackedStateData = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsStackedStateVariables
): BarsStackedStateData => {
  const { chartConfig, observations } = chartProps;
  const { fields } = chartConfig;
  const { y } = fields;
  const {
    sortData,
    yDimension,
    getX,
    getYAsDate,
    getY,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
  });
  const plottableDataWide = useMemo(() => {
    const plottableDataByY = group(plottableData, getY);

    return getWideData({
      dataGrouped: plottableDataByY,
      key: y.componentId,
      getAxisValue: getX,
      getSegment,
    });
  }, [plottableData, getX, y.componentId, getY, getSegment]);
  const sortPlottableData = useCallback(
    (data: Observation[]) => {
      return sortData(data, { plottableDataWide });
    },
    [plottableDataWide, sortData]
  );
  const data = useChartData(plottableData, {
    sortData: sortPlottableData,
    chartConfig,
    timeRangeDimensionId: yDimension.id,
    getAxisValueAsDate: getYAsDate,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });

  return {
    ...data,
    plottableDataWide,
  };
};
