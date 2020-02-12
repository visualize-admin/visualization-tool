import { ascending, extent, group, max, min } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime
} from "d3-scale";
import * as React from "react";
import { ReactNode, useMemo } from "react";
import {
  Observation,
  getDimensionLabel,
  LineFields,
  ObservationValue
} from "../../../domain";
import { getPalette, mkNumber, parseDate } from "../../../domain/helpers";
import { Bounds, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

export interface LinesState {
  data: Observation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  grouped: Map<string, Observation[]>;
  wide: ArrayLike<Record<string, ObservationValue>>;
}

const useLinesState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "measures"> & {
  bounds: Bounds;
  fields: LineFields;
}): LinesState => {
  const { chartWidth, chartHeight } = bounds;

  const getGroups = (d: Observation): string =>
    d[fields.x.componentIri] as string;
  const getX = (d: Observation): Date => parseDate(+d[fields.x.componentIri]);
  const getY = (d: Observation): number => +d[fields.y.componentIri] as number;
  const getSegment = (d: Observation): string =>
    fields.segment ? (d[fields.segment.componentIri] as string) : "segment";

  // x
  const xUniqueValues = [...new Set(data.map(d => getX(d)))];
  const xDomain = extent(data, d => getX(d)) as [Date, Date];
  const xRange = [0, chartWidth];
  const xScale = scaleTime()
    .domain(xDomain)
    .range(xRange)
    .nice();

  // y
  const minValue = Math.min(mkNumber(min(data, getY)), 0);
  const maxValue = max(data, getY) as number;
  const yDomain = [minValue, maxValue];
  const yRange = [chartHeight, 0];
  const yScale = scaleLinear()
    .domain(yDomain)
    .range(yRange)
    .nice();
  const yAxisLabel =
    measures.find(d => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  // segments
  const segments = [...new Set(data.map(getSegment))];
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // data
  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(getX(a), getX(b))),
    [data]
  );
  const xKey = fields.x.componentIri;

  const grouped = group(sortedData, getSegment);
  const wide = useMemo(() => {
    const groupedMap = group(sortedData, getGroups);
    const wider = [];

    for (const [key, values] of groupedMap) {
      const keyObject = values.reduce((obj, cur) => {
        const currentKey = getSegment(cur);
        return {
          ...obj,
          [currentKey]: getY(cur)
        };
      }, {});
      wider
        .push({
          ...keyObject,
          [xKey]: key
        });
    }

    return wider;
  }, [sortedData]);

  return {
    data,
    bounds,
    getX,
    xScale,
    xUniqueValues,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    grouped,
    wide
  };
};

const LineChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: LineFields;
}) => {
  const bounds = useBounds();

  const state = useLinesState({
    data,
    fields,
    measures,
    bounds
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const LineChart = ({
  data,
  fields,
  measures,
  aspectRatio,
  children
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  fields: LineFields;
  children: ReactNode;
}) => {
  return (
    <Observer aspectRatio={aspectRatio}>
      <InteractionProvider>
        <LineChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </LineChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
