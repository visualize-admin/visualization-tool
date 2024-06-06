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
import { ColumnConfig, useChartConfigFilters } from "@/configurator";
import { Observation } from "@/domain/data";
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/ChartProps";

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
    dimensionsByIri,
    measuresByIri,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const bandXVariables = useBandXVariables(x, {
    dimensionsByIri,
    observations,
  });
  const numericalYVariables = useNumericalYVariables("column", y, {
    measuresByIri,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensionsByIri,
    observations,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    interactiveFiltersConfig,
    { dimensionsByIri }
  );

  const { getX } = bandXVariables;
  const sortData: ColumnsStackedStateVariables["sortData"] = useCallback(
    (data, { plottableDataWide }) => {
      const { sortingOrder, sortingType } = x.sorting ?? {};
      const xOrder = plottableDataWide
        .sort((a, b) => ascending(a.total ?? undefined, b.total ?? undefined))
        .map(getX);

      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(getX(a), getX(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(getX(a), getX(b)));
      } else if (sortingType === "byMeasure") {
        return sortByIndex({
          data,
          order: xOrder,
          getCategory: getX,
          sortingOrder,
        });
      } else {
        return [...data].sort((a, b) => ascending(getX(a), getX(b)));
      }
    },
    [getX, x.sorting]
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
  const { sortedPlottableData, plottableDataWide } = useMemo(() => {
    const plottableDataByX = group(plottableData, getX);
    const plottableDataWide = getWideData({
      dataGroupedByX: plottableDataByX,
      xKey: x.componentIri,
      getY,
      getSegment,
    });

    return {
      sortedPlottableData: sortData(plottableData, {
        plottableDataWide,
      }),
      plottableDataWide,
    };
  }, [plottableData, getX, x.componentIri, getY, getSegment, sortData]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
    plottableDataWide,
  };
};
