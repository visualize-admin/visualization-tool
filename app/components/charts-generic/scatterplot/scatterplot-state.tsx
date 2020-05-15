import { max, min, ascending } from "d3-array";
import { ScaleLinear, scaleLinear, ScaleOrdinal, scaleOrdinal } from "d3-scale";
import * as React from "react";
import { ReactNode } from "react";
import { Observation, ScatterPlotFields } from "../../../domain";
import { formatNumber, getPalette, mkNumber } from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
import { Bounds, Observer, useWidth } from "../use-width";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { TooltipScatterplot } from "../annotations/tooltip-content";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { LEFT_MARGIN_OFFSET } from "../constants";

export interface ScatterplotState {
  data: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  hasSegment: boolean;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  yAxisLabel: string;
  getAnnotationInfo: (d: Observation, values: Observation[]) => Tooltip;
}

const useScatterplotState = ({
  data,
  fields,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: ScatterPlotFields;
  aspectRatio: number;
}): ScatterplotState => {
  const width = useWidth();

  const getX = (d: Observation): number => +d[fields.x.componentIri];
  const getY = (d: Observation): number => +d[fields.y.componentIri];
  const getSegment = (d: Observation): string =>
    fields.segment ? (d[fields.segment.componentIri] as string) : "segment";

  // Sort data by segment
  const sortedData = data.sort((a, b) =>
    ascending(getSegment(a), getSegment(b))
  );
  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.y.componentIri;
  const xMinValue = Math.min(mkNumber(min(sortedData, (d) => getX(d))), 0);
  const xMaxValue = max(sortedData, (d) => getX(d)) as number;
  const xDomain = [xMinValue, xMaxValue];
  const xScale = scaleLinear()
    .domain(xDomain)
    .nice();

  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;
  const yMinValue = Math.min(mkNumber(min(sortedData, (d) => getY(d))), 0);
  const yMaxValue = max(sortedData, getY) as number;
  const yDomain = [yMinValue, yMaxValue];
  const yScale = scaleLinear()
    .domain(yDomain)
    .nice();

  const hasSegment = fields.segment ? true : false;
  const segments = sortedData.map(getSegment);
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(formatNumber(yScale.domain()[1]))
  );
  const margins = {
    top: 50,
    right: 40,
    bottom: 50,
    left: left + LEFT_MARGIN_OFFSET,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * aspectRatio;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };
  xScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): Tooltip => {
    const xRef = xScale(getX(datum));
    const yRef = yScale(getY(datum));
    const xAnchor = xRef;
    const yAnchor = yRef;

    const xPlacement =
      xAnchor < chartWidth * 0.33
        ? "right"
        : xAnchor > chartWidth * 0.66
        ? "left"
        : "center";

    const yPlacement =
      yAnchor > chartHeight * 0.33
        ? "top"
        : yAnchor < chartHeight * 0.66
        ? "bottom"
        : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatNumber(getX(datum)),
      tooltipContent: (
        <TooltipScatterplot
          firstLine={fields.segment && getSegment(datum)}
          secondLine={`${xAxisLabel}: ${formatNumber(getX(datum))}`}
          thirdLine={`${yAxisLabel}: ${formatNumber(getY(datum))}`}
        />
      ),
      datum: {
        label: fields.segment && getSegment(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: undefined,
    };
  };

  return {
    data: sortedData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    hasSegment,
    getSegment,
    colors,
    xAxisLabel,
    yAxisLabel,
    getAnnotationInfo,
  };
};

const ScatterplotChartProvider = ({
  data,
  fields,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: ScatterPlotFields;
  aspectRatio: number;
}) => {
  const state = useScatterplotState({
    data,
    fields,
    measures,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ScatterplotChart = ({
  data,
  fields,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  fields: ScatterPlotFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <ScatterplotChartProvider
          data={data}
          fields={fields}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </ScatterplotChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
