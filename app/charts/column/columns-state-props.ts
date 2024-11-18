import { ascending, descending } from "d3-array";
import { useCallback, useMemo } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  NumericalYErrorVariables,
  NumericalYVariables,
  RenderingVariables,
  SortingVariables,
  useBandXVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useNumericalYErrorVariables,
  useNumericalYVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { ColumnConfig, useChartConfigFilters } from "@/configurator";
import { isTemporalEntityDimension } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsStateVariables = BaseVariables &
  SortingVariables &
  BandXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  RenderingVariables &
  InteractiveFiltersVariables;

export const useColumnsStateVariables = (
  props: ChartProps<ColumnConfig>
): ColumnsStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsByIri,
    measures,
    measuresByIri,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, animation } = fields;
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
  const numericalYErrorVariables = useNumericalYErrorVariables(y, {
    numericalYVariables,
    dimensions,
    measures,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    interactiveFiltersConfig,
    { dimensionsByIri }
  );

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
    ...interactiveFiltersVariables,
    getRenderingKey,
  };
};

export const useColumnsStateData = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { sortData, xDimension, getXAsDate, getY, getTimeRangeDate } =
    variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const sortedPlottableData = useMemo(() => {
    return sortData(plottableData);
  }, [sortData, plottableData]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    timeRangeDimensionIri: xDimension.iri,
    getXAsDate,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
