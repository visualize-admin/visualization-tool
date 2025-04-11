import { ascending, descending } from "d3-array";
import { useCallback } from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandYVariables,
  BaseVariables,
  ChartStateData,
  InteractiveFiltersVariables,
  LimitsVariables,
  NumericalXErrorVariables,
  NumericalXVariables,
  RenderingVariables,
  SegmentVariables,
  SortingVariables,
  useBandYVariables,
  useBaseVariables,
  useChartData,
  useInteractiveFiltersVariables,
  useLimitsVariables,
  useNumericalXErrorVariables,
  useNumericalXVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { useChartConfigFilters, useLimits } from "@/config-utils";
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
  InteractiveFiltersVariables &
  LimitsVariables;

export const useBarsStateVariables = (
  props: ChartProps<BarConfig> & { limits: ReturnType<typeof useLimits> }
): BarsStateVariables => {
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
  const limitsVariables = useLimitsVariables(limits);

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
    ...limitsVariables,
    getRenderingKey,
  };
};

export const useBarsStateData = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsStateVariables
): ChartStateData => {
  const { chartConfig, dimensions, observations } = chartProps;
  const { sortData, yDimension, getYAsDate, getX, getTimeRangeDate } =
    variables;
  const plottableData = usePlottableData(observations, {
    getX,
  });

  return useChartData(plottableData, {
    sortData,
    chartConfig,
    dimensions,
    timeRangeDimensionId: yDimension.id,
    getAxisValueAsDate: getYAsDate,
    getTimeRangeDate,
  });
};
