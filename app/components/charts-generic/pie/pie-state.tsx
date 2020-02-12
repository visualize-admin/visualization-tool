import { ScaleOrdinal, scaleOrdinal } from "d3-scale";
import * as React from "react";
import { ReactNode } from "react";
import { Observation, PieFields } from "../../../domain";
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
}: Pick<ChartProps, "data" | "measures"> & {
  bounds: Bounds;
  fields: PieFields;
}): PieState => {
  const getValue = (d: Observation): number =>
    +d[fields.value.componentIri] as number;
  const getSegment = (d: Observation): string =>
    d[fields.value.componentIri] as string;

  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    data.map(getSegment)
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
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: PieFields;
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
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  fields: PieFields;
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
