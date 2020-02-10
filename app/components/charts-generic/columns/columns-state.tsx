import { group, max, min, ascending } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal
} from "d3-scale";
import { stack } from "d3-shape";
import * as React from "react";
import { ReactNode, useMemo } from "react";
import {
  Observation,
  getDimensionLabel,
  ColumnFields,
  ObservationValue
} from "../../../domain";
import { getPalette, isNumber, mkNumber } from "../../../domain/helpers";
import { PADDING, PADDING_INNER } from "../columns/constants";
import { Bounds, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

export interface ColumnsState {
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  xScale: ScaleBand<string>;
  xScaleIn: ScaleBand<string>;
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  yStackScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  wide: Record<string, ObservationValue>[];
  grouped: [string, Record<string, ObservationValue>[]][];
  series: $FixMe[];
}

const useColumnsState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  bounds: Bounds;
}): ColumnsState => {
  const { chartWidth, chartHeight } = bounds;

  const getX = (d: Observation): string => d.x as string;
  const getY = (d: Observation): number => +d.y as number;
  const getSegment = (d: Observation): string => d.segment as string;

  // FIXME: sorting:
  // - Always sort by X (~ by time or alphabetically)
  // - If not time dimension, make sort optional
  //    - by x
  //    - by y
  // How to know it is a time dimension ??
  const sortedData = [...data].sort((a, b) => ascending(getX(a), getX(b)));

  // segments
  const segments = Array.from(new Set(sortedData.map(d => getSegment(d))));
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

  // x
  const bandDomain = [...new Set(sortedData.map(d => getX(d) as string))];
  const xScale = scaleBand()
    .domain(bandDomain)
    .range([0, chartWidth])
    .padding(PADDING);

  const inBandDomain = [...new Set(data.map(d => d.segment as string))];
  const xScaleIn = scaleBand()
    .domain(inBandDomain)
    .range([0, xScale.bandwidth()])
    .padding(PADDING_INNER);

  // y
  const minValue = Math.min(mkNumber(min(sortedData, d => getY(d))), 0);
  const maxValue = max(sortedData, d => getY(d)) as number;
  const yScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .range([chartHeight, 0])
    .nice();
  const yAxisLabel = getDimensionLabel(
    measures.find(
      d => d.component.iri.value === (fields as ColumnFields).y.componentIri
    )!
  );

  const stackMemo = useMemo(() => {
    const wide: Record<string, ObservationValue>[] = [];
    const groupedMap = group(sortedData, getX);
    for (const [key, values] of groupedMap) {
      const keyObject = values.reduce(
        (obj, cur) => {
          const currentKey = cur.segment as string;
          const currentY = isNumber(getY(cur)) ? getY(cur) : 0;
          const total = currentY + (obj.total as number);
          return {
            ...obj,
            [currentKey]: getY(cur),
            total
          };
        },
        { total: 0 }
      );
      wide.push({
        ...keyObject,
        x: key
      });
    }

    const maxTotal = max<$FixMe, number>(wide, d => d.total) as number;
    const yStackDomain = [0, maxTotal] as [number, number];

    const stacked = stack().keys(segments);

    const series = stacked(wide as { [key: string]: number }[]);

    return { yStackDomain, groupedMap, wide, series };
  }, [segments, sortedData]);

  const { yStackDomain, groupedMap, wide, series } = stackMemo;
  const yStackScale = scaleLinear()
    .domain(yStackDomain)
    .range([chartHeight, 0])
    .nice();

  const grouped = [...groupedMap];

  return {
    sortedData,
    bounds,
    getX,
    xScale,
    xScaleIn,
    getY,
    yScale,
    yStackScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    wide,
    grouped,
    series
  };
};

const ColumnChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
}) => {
  const bounds = useBounds();

  const state = useColumnsState({
    data,
    fields,
    measures,
    bounds
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ColumnChart = ({
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
        <ColumnChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </ColumnChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
