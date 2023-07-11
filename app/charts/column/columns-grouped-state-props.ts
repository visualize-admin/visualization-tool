import { ascending, rollup, sum } from "d3";
import orderBy from "lodash/orderBy";
import React from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  ChartStateData,
  NumericalYErrorVariables,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useBandXVariables,
  useChartData,
  useNumericalYErrorVariables,
  useNumericalYVariables,
  useSegmentVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { ColumnConfig, ColumnFields } from "@/configurator";
import { Observation } from "@/domain/data";
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsGroupedStateVariables = BandXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  SegmentVariables &
  RenderingVariables;

export const useColumnsGroupedStateVariables = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): ColumnsGroupedStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields, filters, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;

  const bandXVariables = useBandXVariables(x, {
    dimensions,
    observations,
  });
  const numericalYVariables = useNumericalYVariables(y, {
    measures,
  });
  const numericalYErrorVariables = useNumericalYErrorVariables(y, {
    numericalYVariables,
    dimensions,
    measures,
  });
  const segmentVariables = useSegmentVariables(segment, {
    dimensions,
    observations,
  });

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    ...bandXVariables,
    ...numericalYVariables,
    ...numericalYErrorVariables,
    ...segmentVariables,
    getRenderingKey,
  };
};

export const useColumnsGroupedStateData = (
  chartProps: ChartProps<ColumnConfig> & { aspectRatio: number },
  variables: ColumnsGroupedStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { fields } = chartConfig;
  const { x } = fields;
  const { getX, getXAsDate, getY, getSegment } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      x,
      getX,
      getY,
    });
  }, [plottableData, x, getX, getY]);
  const { chartData, scalesData, segmentData } = useChartData(
    sortedPlottableData,
    {
      chartConfig,
      getXAsDate,
      getSegment,
    }
  );

  return {
    chartData,
    scalesData,
    segmentData,
    allData: sortedPlottableData,
  };
};

const sortData = (
  data: Observation[],
  {
    x,
    getX,
    getY,
  }: {
    x: ColumnFields["x"];
  } & Pick<ColumnsGroupedStateVariables, "getX" | "getY">
) => {
  const { sortingOrder, sortingType } = x.sorting ?? {};
  const order = [
    ...rollup(
      data,
      (v) => sum(v, (d) => getY(d)),
      (d) => getX(d)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  if (sortingType === "byDimensionLabel") {
    return orderBy(data, getX, sortingOrder);
  } else if (sortingType === "byMeasure") {
    return sortByIndex({ data, order, getCategory: getX, sortingOrder });
  } else {
    return orderBy(data, getX, "asc");
  }
};
