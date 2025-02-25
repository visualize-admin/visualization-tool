import { ascending, descending } from "d3-array";
import { useCallback, useMemo } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandYVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  NumericalXErrorVariables,
  NumericalXVariables,
  RenderingVariables,
  SegmentVariables,
  SortingVariables,
  useBandYVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useNumericalXErrorVariables,
  useNumericalXVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters } from "@/config-utils";
import { BarConfig } from "@/configurator";
import { isTemporalEntityDimension } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type BarsStateVariables = BaseVariables &
  SortingVariables &
  NumericalXVariables &
  BandYVariables &
  NumericalXErrorVariables &
  SegmentVariables &
  RenderingVariables &
  InteractiveFiltersVariables;

export const useBarsStateVariables = (
  props: ChartProps<BarConfig>
): BarsStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measures,
    measuresById,
  } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, animation, segment } = fields;
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
  const numericalXErrorVariables = useNumericalXErrorVariables(x, {
    getValue: numericalXVariables.getX,
    dimensions,
    measures,
  });
  const interactiveFiltersVariables = useInteractiveFiltersVariables(
    interactiveFiltersConfig,
    { dimensionsById }
  );

  const { getY, getYAsDate } = bandYVariables;
  const { getX } = numericalXVariables;
  const sortData: BarsStateVariables["sortData"] = useCallback(
    (data) => {
      const { sortingOrder, sortingType } = y.sorting ?? {};
      const yGetter = isTemporalEntityDimension(yDimension) ? getYAsDate : getY;
      if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => descending(yGetter(a), yGetter(b)));
      } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
        return [...data].sort((a, b) => ascending(yGetter(a), yGetter(b)));
      } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
        return [...data].sort((a, b) =>
          descending(getX(a) ?? -1, getX(b) ?? -1)
        );
      } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
        return [...data].sort((a, b) =>
          ascending(getX(a) ?? -1, getX(b) ?? -1)
        );
      } else {
        return [...data].sort((a, b) => ascending(yGetter(a), yGetter(b)));
      }
    },
    [getX, getYAsDate, getY, y.sorting, yDimension]
  );

  const segmentVariables = useSegmentVariables(segment, {
    dimensionsById,
    observations,
  });
  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    ...segmentVariables,
    ...baseVariables,
    sortData,
    ...bandYVariables,
    ...numericalXVariables,
    ...numericalXErrorVariables,
    ...interactiveFiltersVariables,
    getRenderingKey,
  };
};

export const useBarsStateData = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { sortData, yDimension, getYAsDate, getX, getTimeRangeDate } =
    variables;
  const plottableData = usePlottableData(observations, {
    getX,
  });
  const sortedPlottableData = useMemo(() => {
    return sortData(plottableData);
  }, [sortData, plottableData]);
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    timeRangeDimensionId: yDimension.id,
    getAxisValueAsDate: getYAsDate,
    getTimeRangeDate,
  });

  return {
    ...data,
    allData: sortedPlottableData,
  };
};
