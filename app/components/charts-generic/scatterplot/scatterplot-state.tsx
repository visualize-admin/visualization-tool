import { max, min } from "d3-array";
import { ScaleLinear, scaleLinear, ScaleOrdinal, scaleOrdinal } from "d3-scale";
import * as React from "react";
import { ReactNode } from "react";
import {
  Observation,
  getDimensionLabel,
  ScatterPlotFields
} from "../../../domain";
import { getPalette, mkNumber } from "../../../domain/helpers";
import { Bounds, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

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
}

const useScatterplotState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  bounds: Bounds;
}): ScatterplotState => {
  const { chartWidth, chartHeight } = bounds;

  const getX = (d: Observation): number => +d.x;
  const getY = (d: Observation): number => +d.y;
  const getSegment = (d: Observation): string => d.segment as string;

  const xAxisLabel = getDimensionLabel(
    measures.find(
      d =>
        d.component.iri.value === (fields as ScatterPlotFields).x.componentIri
    )!
  );
  const xMinValue = Math.min(mkNumber(min(data, d => getX(d))), 0);
  const xMaxValue = max(data, d => getX(d)) as number;
  const xDomain = [xMinValue, xMaxValue];
  const xRange = [0, chartWidth];
  const xScale = scaleLinear()
    .domain(xDomain)
    .range(xRange)
    .nice();

  const yAxisLabel = getDimensionLabel(
    measures.find(
      d =>
        d.component.iri.value === (fields as ScatterPlotFields).y.componentIri
    )!
  );
  const yMinValue = Math.min(mkNumber(min(data, d => getY(d))), 0);
  const yMaxValue = max(data, d => getY(d)) as number;
  const yDomain = [yMinValue, yMaxValue];
  const yRange = [chartHeight, 0];
  const yScale = scaleLinear()
    .domain(yDomain)
    .range(yRange)
    .nice();

  const hasSegment = fields.segment ? true : false;
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    data.map(d => getSegment(d) as string)
  );

  return {
    data,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    hasSegment,
    getSegment,
    colors,
    xAxisLabel,
    yAxisLabel
  };
};

const ScatterplotChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
}) => {
  const bounds = useBounds();

  const state = useScatterplotState({
    data,
    fields,
    measures,
    bounds
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
  children
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  aspectRatio: number;
  children: ReactNode;
}) => {
  return (
    <Observer aspectRatio={aspectRatio}>
      <InteractionProvider>
        <ScatterplotChartProvider
          data={data}
          fields={fields}
          measures={measures}
        >
          {children}
        </ScatterplotChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
