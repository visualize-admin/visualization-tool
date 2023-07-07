import { ascending, descending } from "d3";
import get from "lodash/get";
import React from "react";

import {
  getLabelWithUnit,
  getMaybeTemporalDimensionValues,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  usePlottableData,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  ChartStateData,
  NumericalYErrorVariables,
  NumericalYVariables,
  RenderingVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { ColumnConfig, ColumnFields } from "@/configurator";
import {
  useErrorMeasure,
  useErrorRange,
  useErrorVariable,
} from "@/configurator/components/ui-helpers";
import {
  Observation,
  isNumericalMeasure,
  isTemporalDimension,
} from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsStateVariables = BandXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  RenderingVariables;

export const useColumnsStateVariables = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): ColumnsStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields, filters, interactiveFiltersConfig } = chartConfig;
  const { x, y, animation } = fields;

  const _xDimension = dimensions.find((d) => d.iri === x.componentIri);
  if (!_xDimension) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  const yMeasure = measures.find((d) => d.iri === y.componentIri);
  if (!yMeasure) {
    throw Error(`No dimension <${y.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(yMeasure)) {
    throw Error(`Measure <${y.componentIri}> is not numerical!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const xDimension = React.useMemo(() => {
    const values = getMaybeTemporalDimensionValues(_xDimension, observations);
    return { ..._xDimension, values };
  }, [_xDimension, observations]);

  const xTimeUnit = isTemporalDimension(xDimension)
    ? xDimension.timeUnit
    : undefined;

  const {
    getAbbreviationOrLabelByValue: getXAbbreviationOrLabel,
    getValue: getX,
    getLabel: getXLabel,
  } = useDimensionWithAbbreviations(xDimension, {
    observations,
    field: x,
  });

  const getXAsDate = useTemporalVariable(fields.x.componentIri);
  const getY = useOptionalNumericVariable(fields.y.componentIri);
  const yErrorMeasure = useErrorMeasure(props, fields.y.componentIri);
  const getYErrorRange = useErrorRange(yErrorMeasure, getY);
  const getYError = useErrorVariable(yErrorMeasure);
  const showYStandardError = get(fields, ["y", "showStandardError"], true);

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    xTimeUnit,
    yMeasure,
    getY,
    showYStandardError,
    yErrorMeasure,
    getYError,
    getYErrorRange,
    yAxisLabel,
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
  const { chartData, scalesData, segmentData } = useChartData(
    sortedPlottableData,
    {
      chartConfig,
      getXAsDate,
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
