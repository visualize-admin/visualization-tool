import { ascending, rollup, sum } from "d3-array";
import orderBy from "lodash/orderBy";
import { useCallback } from "react";

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
import { isTemporalEntityDimension, Observation } from "@/domain/data";
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/chart-props";

export type BarsGroupedStateVariables = BaseVariables &
  SortingVariables &
  BandYVariables &
  NumericalXVariables &
  NumericalXErrorVariables &
  SegmentVariables &
  RenderingVariables &
  InteractiveFiltersVariables;

export const useBarsGroupedStateVariables = (
  props: ChartProps<BarConfig>
): BarsGroupedStateVariables => {
  const {
    chartConfig,
    observations,
    dimensions,
    dimensionsById,
    measures,
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
  const numericalXErrorVariables = useNumericalXErrorVariables(x, {
    getValue: numericalXVariables.getX,
    dimensions,
    measures,
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
  const { getX } = numericalXVariables;
  const sortData: BarsGroupedStateVariables["sortData"] = useCallback(
    (data) => {
      const { sortingOrder, sortingType } = y.sorting ?? {};
      const yGetter = isTemporalEntityDimension(yDimension)
        ? (d: Observation) => getYAsDate(d).getTime().toString()
        : getY;
      const order = [
        ...rollup(
          data,
          (v) => sum(v, (d) => getX(d)),
          (d) => yGetter(d)
        ),
      ]
        .sort((a, b) => ascending(a[1], b[1]))
        .map((d) => d[0]);

      if (sortingType === "byDimensionLabel") {
        return orderBy(data, yGetter, sortingOrder);
      } else if (sortingType === "byMeasure") {
        return sortByIndex({ data, order, getCategory: yGetter, sortingOrder });
      } else {
        return orderBy(data, yGetter, "asc");
      }
    },
    [getX, getYAsDate, getY, y.sorting, yDimension]
  );

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    animation
  );

  return {
    ...baseVariables,
    sortData,
    ...bandYVariables,
    ...numericalXVariables,
    ...numericalXErrorVariables,
    ...segmentVariables,
    ...interactiveFiltersVariables,
    getRenderingKey,
  };
};

export const useBarsGroupedStateData = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsGroupedStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const {
    sortData,
    yDimension,
    getYAsDate,
    getX,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
  });

  return useChartData(plottableData, {
    sortData,
    chartConfig,
    timeRangeDimensionId: yDimension.id,
    getAxisValueAsDate: getYAsDate,
    getSegmentAbbreviationOrLabel,
    getTimeRangeDate,
  });
};
