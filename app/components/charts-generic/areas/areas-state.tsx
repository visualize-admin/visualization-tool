import { ascending, extent, group, max } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime
} from "d3-scale";
import { stack } from "d3-shape";
import * as React from "react";
import { ReactNode, useMemo } from "react";
import { AreaFields, getDimensionLabel, Observation } from "../../../domain";
import { getPalette, isNumber, parseDate } from "../../../domain/helpers";
import { Bounds, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

export interface AreasState {
  data: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  wide: { [key: string]: number | string }[];
  series: $FixMe[];
}

const useAreasState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  bounds: Bounds;
}): AreasState => {
  const { chartWidth, chartHeight } = bounds;

  const getGroups = (d: Observation): string => d.x as string;
  const getX = (d: Observation): Date => parseDate(+d.x);
  const getY = (d: Observation): number => +d.y as number;
  const getSegment = (d: Observation): string => d.segment as string;

  const yAxisLabel = getDimensionLabel(
    measures.find(
      d => d.component.iri.value === (fields as AreaFields).y.componentIri
    )!
  );

  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(parseDate(+a.x), parseDate(+b.x))),
    [data]
  );

  const segments = Array.from(new Set(sortedData.map(d => getSegment(d))));

  const memo = useMemo(() => {
    const wide: { [key: string]: number | string }[] = [];
    const groupedMap = group(sortedData, getGroups);

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
    const yDomain = [0, maxTotal] as [number, number];

    const stacked = stack().keys(segments);

    const series = stacked(wide as { [key: string]: number }[]);

    return { yDomain, series, wide };
  }, [segments, sortedData]);

  const { yDomain, series, wide } = memo;

  const xUniqueValues = [...new Set(data.map(d => getX(d)))];
  const xDomain = extent(data, d => getX(d)) as [Date, Date];
  const xRange = [0, chartWidth];
  const yRange = [chartHeight, 0];

  const xScale = scaleTime()
    .domain(xDomain)
    .range(xRange)
    .nice();

  const yScale = scaleLinear()
    .domain(yDomain)
    .range(yRange)
    .nice();
  const colors = scaleOrdinal(getPalette(fields.segment?.palette)).domain(
    segments
  );

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
    colors,
    wide,
    series
  };
};

const AreaChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
}) => {
  const bounds = useBounds();

  const state = useAreasState({
    data,
    fields,
    measures,
    bounds
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const AreaChart = ({
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
        <AreaChartProvider data={data} fields={fields} measures={measures}>
          {children}
        </AreaChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
