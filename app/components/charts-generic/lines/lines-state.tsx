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
import { ReactNode, useCallback, useMemo } from "react";
import { LineFields, Observation, ObservationValue } from "../../../domain";
import {
  formatNumber,
  formatYear,
  getPalette,
  mkNumber,
  parseDate
} from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
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
  xAxisLabel: string;
  yAxisLabel: string;
  grouped: Map<string, Observation[]>;
  wide: ArrayLike<Record<string, ObservationValue>>;
  xKey: string;
  getAnnotationInfo: (d: Observation) => Tooltip;
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
  const getX = useCallback(
    (d: Observation): Date => parseDate(d[fields.x.componentIri].toString()),
    [fields.x.componentIri]
  );
  const getY = (d: Observation): number => +d[fields.y.componentIri] as number;
  const getSegment = (d: Observation): string =>
    fields.segment ? (d[fields.segment.componentIri] as string) : "fixme";

  // x
  const xUniqueValues = [...new Set(data.map(d => getX(d)))];
  const xDomain = extent(data, d => getX(d)) as [Date, Date];
  const xRange = [0, chartWidth];
  const xScale = scaleTime()
    .domain(xDomain)
    .range(xRange)
    .nice();
  const xAxisLabel =
    measures.find(d => d.iri === fields.x.componentIri)?.label ??
    fields.x.componentIri;
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
    [data, getX]
  );
  const xKey = fields.x.componentIri;

  const grouped = group(sortedData, getSegment);
  const groupedMap = group(sortedData, getGroups);
  const wide = [];

  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce((obj, cur) => {
      const currentKey = getSegment(cur);
      return {
        ...obj,
        [currentKey]: getY(cur)
      };
    }, {});
    wide.push({
      ...keyObject,
      [xKey]: key
    });
  }

  // Tooltip
  const getAnnotationInfo = (datum: Observation): Tooltip => {
    const xAnchor = xScale(getX(datum));
    const yAnchor = yScale(getY(datum));

    const tooltipValues = data.filter(
      j => getX(j).getTime() === getX(datum).getTime()
    );

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement =
      yAnchor > chartHeight * 0.2
        ? "top"
        : yAnchor < chartHeight * 0.8
        ? "bottom"
        : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatYear(getX(datum)),
      datum: {
        label: fields.segment && getSegment(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string
      },
      values: tooltipValues.map(td => ({
        label: getSegment(td),
        value: formatNumber(getY(td)),
        color: colors(getSegment(td)) as string,
        yPos: yScale(getY(td))
      }))
    };
  };
  return {
    data,
    bounds,
    getX,
    xScale,
    xUniqueValues,
    getY,
    yScale,
    getSegment,
    xAxisLabel,
    yAxisLabel,
    segments,
    colors,
    grouped,
    wide,
    xKey,
    getAnnotationInfo
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
