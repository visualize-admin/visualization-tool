import { ascending, descending, group } from "d3";
import React from "react";

import {
  getLabelWithUnit,
  getMaybeTemporalDimensionValues,
  getWideData,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  usePlottableData,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import {
  BandXVariables,
  ChartStateData,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { ColumnConfig, ColumnFields } from "@/configurator";
import {
  Observation,
  isNumericalMeasure,
  isTemporalDimension,
} from "@/domain/data";
import { sortByIndex } from "@/utils/array";

import { ChartProps } from "../shared/ChartProps";

export type ColumnsStackedStateVariables = BandXVariables &
  NumericalYVariables &
  SegmentVariables &
  RenderingVariables;

export const useColumnsStackedStateVariables = (
  props: ChartProps<ColumnConfig> & { aspectRatio: number }
): ColumnsStackedStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x, y, segment, animation } = fields;

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

  const dimensionKeys = dimensions.map((d) => d.iri);
  const getRenderingKey = useRenderingKeyVariable(
    dimensionKeys,
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
    yAxisLabel,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
    getRenderingKey,
  };
};

export type ColumnsStackedStateData = ChartStateData & {
  plottableDataWide: Observation[];
};

export const useColumnsStackedStateData = (
  chartProps: ChartProps<ColumnConfig> & { aspectRatio: number },
  variables: ColumnsStackedStateVariables
): ColumnsStackedStateData => {
  const { chartConfig, observations } = chartProps;
  const { fields } = chartConfig;
  const { x } = fields;
  const { getX, getXAsDate, getY, getSegment } = variables;
  const plottableData = usePlottableData(observations, {
    getY,
  });
  const { sortedPlottableData, plottableDataWide } = React.useMemo(() => {
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
        x,
        getX,
      }),
      plottableDataWide,
    };
  }, [plottableData, x, getX, getY, getSegment]);
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
    plottableDataWide,
  };
};

const sortData = (
  data: Observation[],
  {
    plottableDataWide,
    x,
    getX,
  }: {
    x: ColumnFields["x"];
  } & Pick<ColumnsStackedStateVariables, "getX"> &
    Pick<ColumnsStackedStateData, "plottableDataWide">
) => {
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
};
