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
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  bounds: Bounds;
}): LinesState => {
  const { chartWidth, chartHeight } = bounds;

  const getGroups = (d: Observation): string => d.x as string;
  const getX = (d: Observation): Date => parseDate(+d.x);
  const getY = (d: Observation): number => +d.y as number;
  const getSegment = (d: Observation): string => d.segment as string;

  // x
  const xUniqueValues = [...new Set(data.map(d => getX(d)))];
  const xDomain = extent(data, d => getX(d)) as [Date, Date];
  const xRange = [0, chartWidth];
  const xScale = scaleTime()
    .domain(xDomain)
    .range(xRange)
    .nice();

  // y
  const minValue = Math.min(mkNumber(min(data, d => +d.y)), 0);
  const maxValue = max(data, d => +d.y) as number;
  const yDomain = [minValue, maxValue];
  const yRange = [chartHeight, 0];
  const yScale = scaleLinear()
    .domain(yDomain)
    .range(yRange)
    .nice();
  const yAxisLabel = getDimensionLabel(
    measures.find(
      d => d.component.iri.value === (fields as LineFields).y.componentIri
    )!
  );

  // segments
  const segments = [...new Set(data.map(d => d.segment as string))];
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // data
  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(parseDate(+a.x), parseDate(+b.x))),
    [data]
  );
  const grouped = group(sortedData, getSegment);
  const wide = useMemo(() => {
    const groupedMap = group(sortedData, getGroups);
    const wider = [];

    for (const [key, values] of groupedMap) {
      const keyObject = values.reduce((obj, cur) => {
        const currentKey = cur.segment as string;
        return {
          ...obj,
          [currentKey]: getY(cur)
        };
      }, {});
      wider.push({
        ...keyObject,
        x: key
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
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
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
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  aspectRatio: number;
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
