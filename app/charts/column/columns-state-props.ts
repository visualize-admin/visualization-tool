import { ascending, descending } from "d3";
import React from "react";

import { usePlottableData } from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  BaseVariables,
  ChartStateData,
  NumericalYErrorVariables,
  NumericalYVariables,
  RenderingVariables,
  useBandXVariables,
  useBaseVariables,
  useChartData,
  useNumericalYErrorVariables,
  useNumericalYVariables,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import {
  ColumnConfig,
  ColumnFields,
  useChartConfigFilters,
} from "@/configurator";
import { Observation } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsStateVariables = BaseVariables &
  BandXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  RenderingVariables;

export const useColumnsStateVariables = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
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
  const filters = useChartConfigFilters(chartConfig);

  const baseVariables = useBaseVariables(chartConfig);
  const bandXVariables = useBandXVariables(x, {
    dimensionsByIri,
    observations,
  });
  const numericalYVariables = useNumericalYVariables(y, {
    measuresByIri,
  });
  const numericalYErrorVariables = useNumericalYErrorVariables(y, {
    numericalYVariables,
    dimensions,
    measures,
  });

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    ...baseVariables,
    ...bandXVariables,
    ...numericalYVariables,
    ...numericalYErrorVariables,
    getRenderingKey,
  };
};

export const useColumnsStateData = (
  chartProps: ChartProps<ColumnConfig> & { aspectRatio: number },
  variables: ColumnsStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { fields } = chartConfig;
  const { x } = fields;
  const { getX, getXAsDate, getY } = variables;
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
  const data = useChartData(sortedPlottableData, {
    chartConfig,
    getXAsDate,
  });

  return {
    ...data,
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
  } & Pick<ColumnsStateVariables, "getX" | "getY">
) => {
  const { sortingOrder, sortingType } = x.sorting ?? {};
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getY(a) ?? -1, getY(b) ?? -1));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getY(a) ?? -1, getY(b) ?? -1));
  } else {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
