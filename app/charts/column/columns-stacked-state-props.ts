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
import { Observation, isTemporalEntityDimension } from "@/domain/data";
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
  const xDimension = dimensionsByIri[x.componentIri];
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
    timeRangeDimensionIri: xDimension.iri,
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
