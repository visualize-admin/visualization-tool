import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import * as React from "react";
import { ReactNode } from "react";
import { Observation } from "../../../domain";
import { getPalette } from "../../../domain/helpers";
import { Bounds, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

export interface PieState {
  data: Observation[];
  bounds: Bounds;
  getValue: (d: Observation) => number;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
}

const usePieState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  bounds: Bounds;
}): PieState => {
  const getValue = (d: Observation): number => +d.value as number;
  const getSegment = (d: Observation): string => d.segment as string;

  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    data.map(d => getSegment(d) as string)
  );

  return {
    data,
    bounds,
    getValue,
    getSegment,
    colors
  };
};

const PieChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
}) => {
  const bounds = useBounds();

  const state = usePieState({
    data,
    fields,
    measures,
    bounds
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const PieChart = ({
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
        <PieChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </PieChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
