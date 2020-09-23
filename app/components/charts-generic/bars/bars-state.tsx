import { ascending, descending, max, min } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import {
  BarFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { Observation } from "../../../domain/data";
import { getPalette, mkNumber } from "../../../domain/helpers";
import {
  BAR_HEIGHT,
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  BAR_SPACE_ON_TOP,
} from "./constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export interface BarsState {
  chartType: "bar";
  bounds: Bounds;
  sortedData: Observation[];
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => string;
  yScale: ScaleBand<string>;
  getSegment: (d: Observation) => string;
  segments: string[];
  xAxisLabel: string;
  colors: ScaleOrdinal<string, string>;
}

const useBarsState = ({
  data,
  fields,
  measures,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: BarFields;
}): BarsState => {
  const width = useWidth();

  const getX = useCallback(
    (d: Observation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );

  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.y.componentIri;

  // Sort data
  const sortingType = fields.y.sorting?.sortingType;
  const sortingOrder = fields.y.sorting?.sortingOrder;

  const sortedData = useMemo(() => {
    return sortData({ data, sortingType, sortingOrder, getX, getY });
  }, [data, getX, getY, sortingType, sortingOrder]);

  // segments
  const segments = Array.from(new Set(sortedData.map((d) => getSegment(d))));
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // x
  const minValue = Math.min(mkNumber(min(sortedData, (d) => getX(d))), 0);
  const maxValue = max(sortedData, (d) => getX(d));
  const xScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();

  // y
  const bandDomain = [...new Set(sortedData.map((d) => getY(d)))];

  const chartHeight = bandDomain.length * (BAR_HEIGHT + BAR_SPACE_ON_TOP);
  const yScale = scaleBand<string>().domain(bandDomain).range([0, chartHeight]);

  const margins = {
    top: 50,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: LEFT_MARGIN_OFFSET,
  };

  const chartWidth = width - margins.left - margins.right;

  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };
  xScale.range([0, chartWidth]);

  return {
    chartType: "bar",
    bounds,
    sortedData,
    getX,
    xScale,
    getY,
    yScale,
    getSegment,
    segments,
    xAxisLabel,
    colors,
  };
};

const BarChartProvider = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useBarsState({
    data,
    fields,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const BarChart = ({
  data,
  fields,
  measures,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <BarChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </BarChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  getY,
  sortingType,
  sortingOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => number;
  getY: (d: Observation) => string;
  sortingType?: SortingType;
  sortingOrder?: SortingOrder;
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else if (sortingOrder === "desc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byMeasure") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else {
    // default to ascending alphabetical
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  }
};
