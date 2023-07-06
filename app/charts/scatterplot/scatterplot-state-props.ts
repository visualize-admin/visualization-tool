import {
  getLabelWithUnit,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateData,
  NumericalXVariables,
  NumericalYVariables,
  SegmentVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { ScatterPlotConfig } from "@/configurator";
import { isNumericalMeasure } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type ScatterplotStateVariables = NumericalXVariables &
  NumericalYVariables &
  SegmentVariables;

export const useScatterplotStateVariables = (
  props: ChartProps<ScatterPlotConfig> & { aspectRatio: number }
): ScatterplotStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;

  const xMeasure = measures.find((d) => d.iri === x.componentIri);
  if (!xMeasure) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(xMeasure)) {
    throw Error(`Measure <${x.componentIri}> is not numerical!`);
  }

  const getX = useOptionalNumericVariable(x.componentIri);
  const xAxisLabel = getLabelWithUnit(xMeasure);

  const yMeasure = measures.find((d) => d.iri === y.componentIri);
  if (!yMeasure) {
    throw Error(`No dimension <${y.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(yMeasure)) {
    throw Error(`Measure <${y.componentIri}> is not numerical!`);
  }

  const getY = useOptionalNumericVariable(y.componentIri);
  const yAxisLabel = getLabelWithUnit(yMeasure);

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
    xMeasure,
    getX,
    xAxisLabel,
    yMeasure,
    getY,
    yAxisLabel,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  };
};

export const useScatterplotStateData = (
  chartProps: ChartProps<ScatterPlotConfig> & { aspectRatio: number },
  variables: ScatterplotStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getX, getY, getSegment } = variables;
  // No need to sort the data for pie.
  const plottableData = usePlottableData(observations, {
    getX,
    getY,
  });
  const { chartData, scalesData, segmentData } = useChartData(plottableData, {
    chartConfig,
    getSegment,
  });

  return {
    chartData,
    scalesData,
    segmentData,
    allData: plottableData,
  };
};
