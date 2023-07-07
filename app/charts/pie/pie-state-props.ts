import {
  getLabelWithUnit,
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  usePlottableData,
} from "@/charts/shared/chart-helpers";
import {
  ChartStateData,
  NumericalYVariables,
  RenderingVariables,
  SegmentVariables,
  useChartData,
} from "@/charts/shared/chart-state";
import { useRenderingKeyVariable } from "@/charts/shared/rendering-utils";
import { PieConfig } from "@/configurator";
import { isNumericalMeasure } from "@/domain/data";

import { ChartProps } from "../shared/ChartProps";

export type PieStateVariables = NumericalYVariables &
  SegmentVariables &
  RenderingVariables;

export const usePieStateVariables = (
  props: ChartProps<PieConfig> & { aspectRatio: number }
): PieStateVariables => {
  const { chartConfig, observations, dimensions, measures } = props;
  const { fields, filters, interactiveFiltersConfig } = chartConfig;
  const { y, segment, animation } = fields;

  const yMeasure = measures.find((d) => d.iri === y.componentIri);
  if (!yMeasure) {
    throw Error(`No dimension <${y.componentIri}> in cube!`);
  }

  if (!isNumericalMeasure(yMeasure)) {
    throw Error(`Measure <${y.componentIri}> is not numerical!`);
  }

  const yAxisLabel = getLabelWithUnit(yMeasure);

  const getY = useOptionalNumericVariable(y.componentIri);

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

  const getRenderingKey = useRenderingKeyVariable(
    dimensions,
    filters,
    interactiveFiltersConfig,
    animation
  );

  return {
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

export const usePieStateData = (
  chartProps: ChartProps<PieConfig> & { aspectRatio: number },
  variables: PieStateVariables
): ChartStateData => {
  const { chartConfig, observations } = chartProps;
  const { getY, getSegment } = variables;
  // No need to sort the data for pie.
  const plottableData = usePlottableData(observations, {
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
