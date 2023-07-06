import { ascending } from "d3";
import React from "react";

import { ChartProps } from "@/charts/shared/ChartProps";
import {
  useDimensionWithAbbreviations,
  useOptionalNumericVariable,
  usePlottableData,
  useStringVariable,
  useTemporalVariable,
} from "@/charts/shared/chart-helpers";
import { ChartStateData, useChartData } from "@/charts/shared/chart-state";
import { AreaConfig } from "@/config-types";
import {
  DimensionValue,
  Observation,
  isTemporalDimension,
} from "@/domain/data";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { TemporalDimension } from "@/graphql/resolver-types";

export type AreasStateVariables = {
  xDimension: TemporalDimension;
  getX: (d: Observation) => Date;
  getY: (d: Observation) => number | null;
  getGroups: (d: Observation) => string;
  segmentDimension: DimensionMetadataFragment | undefined;
  segmentsByAbbreviationOrLabel: Map<string, DimensionValue>;
  getSegment: (d: Observation) => string;
  getSegmentAbbreviationOrLabel: (d: Observation) => string;
  getSegmentLabel: (d: string) => string;
};

export const useAreasStateVariables = (
  props: ChartProps<AreaConfig> & { aspectRatio: number }
): AreasStateVariables => {
  const { chartConfig, observations, dimensions } = props;
  const { fields } = chartConfig;
  const { x, y, segment } = fields;
  const xDimension = dimensions.find((d) => d.iri === x.componentIri);

  if (!xDimension) {
    throw Error(`No dimension <${x.componentIri}> in cube!`);
  }

  if (!isTemporalDimension(xDimension)) {
    throw Error(`Dimension <${x.componentIri}> is not temporal!`);
  }

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
    getY,
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
      getXDate: getX,
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
  { getX }: { getX: (d: Observation) => Date }
): Observation[] => {
  return [...data].sort((a, b) => {
    return ascending(getX(a), getX(b));
  });
};
