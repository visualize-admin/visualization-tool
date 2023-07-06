import { ascending, rollup, sum } from "d3";
import get from "lodash/get";
import orderBy from "lodash/orderBy";
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
  SegmentVariables,
  useChartData,
} from "@/charts/shared/chart-state";
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
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsGroupedStateVariables = BandXVariables &
  NumericalYVariables &
  NumericalYErrorVariables &
  SegmentVariables;

export const useColumnsGroupedStateVariables = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): ColumnsGroupedStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

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

  const segmentDimension = dimensions.find(
    (d) => d.iri === segment?.componentIri
  );
  const {
    getAbbreviationOrLabelByValue: getSegmentAbbreviationOrLabel,
    abbreviationOrLabelLookup: segmentsByAbbreviationOrLabel,
    getValue: getSegment,
    getLabel: getSegmentLabel,
  } = useDimensionWithAbbreviations(segmentDimension, {
    observations,
    field: segment,
  });

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
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
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
