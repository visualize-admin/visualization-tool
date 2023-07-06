import { ascending } from "d3";
import React from "react";

import { ChartProps } from "@/charts/shared/ChartProps";
import {
  getLabelWithUnit,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  usePlottableData,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateData,
  NumericalYVariables,
  SegmentVariables,
  TemporalXVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { AreaConfig } from "@/config-types";
import {
  Observation,
  isNumericalMeasure,
  isTemporalDimension,
} from "@/domain/data";

export type AreasStateVariables = TemporalXVariables &
  NumericalYVariables &
  SegmentVariables & {
    getGroups: (d: Observation) => string;
  };

export const useAreasStateVariables = (
  props: ChartProps<AreaConfig> & { aspectRatio: number }
): AreasStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const xDimension = dimensions.find((d) => d.iri === x.componentIri);
  if (!xDimension) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  if (!isTemporalDimension(xDimension)) {
    throw Error(`Dimension <${x.componentIri}> is not temporal!`);
  }

  const yMeasure = measures.find((d) => d.iri === fields.y.componentIri);
  if (!yMeasure) {
    throw Error(`No dimension <${fields.y.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(yMeasure)) {
    throw Error(`Measure <${y.componentIri}> is not numerical!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const getX = useTemporalVariable(x.componentIri);
  const getY = useOptionalNumericVariable(y.componentIri);
  const getGroups = useStringVariable(x.componentIri);

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
    yMeasure,
    getY,
    yAxisLabel,
    getGroups,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  };
};

export const useAreasStateData = (
  chartProps: ChartProps<AreaConfig> & { aspectRatio: number },
  variables: AreasStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, getY, getSegment } = variables;
  const plottableData = usePlottableData(observations, {
    getX,
    getY,
  });
  const sortedPlottableData = React.useMemo(() => {
    return sortData(plottableData, {
      getX,
    });
  }, [plottableData, getX]);
  const { chartData, scalesData, segmentData } = useChartData(
    sortedPlottableData,
    {
      chartConfig,
      getXAsDate: getX,
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
  { getX }: Pick<AreasStateVariables, "getX">
): Observation[] => {
  return [...data].sort((a, b) => {
    return ascending(getX(a), getX(b));
  });
};
