import { ascending, group, max, min } from "d3-array";
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
import { ReactNode } from "react";
import { ColumnFields, Observation, ObservationValue } from "../../../domain";
import {
  formatNumber,
  getPalette,
  isNumber,
  mkNumber
} from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
import {
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN
} from "../columns/constants";
import { Bounds, Observer, useBounds } from "../use-bounds";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

export interface ColumnsState {
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
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
  getAnnotationInfo: (d: Observation) => Tooltip;
}

const useColumnsState = ({
  data,
  fields,
  measures,
  bounds
}: Pick<ChartProps, "data" | "measures"> & {
  bounds: Bounds;
  fields: ColumnFields;
}): ColumnsState => {
  const { chartWidth, chartHeight } = bounds;

  const getX = (d: Observation): string => d[fields.x.componentIri] as string;
  const getY = (d: Observation): number => +d[fields.y.componentIri];
  const getSegment = (d: Observation): string =>
    fields.segment ? (d[fields.segment.componentIri] as string) : "segment";

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
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);
  const xScaleInteraction = scaleBand()
    .domain(bandDomain)
    .range([0, chartWidth])
    .paddingInner(0)
    .paddingOuter(0);

  const inBandDomain = [...new Set(data.map(getSegment))];
  const xScaleIn = scaleBand()
    .domain(inBandDomain)
    .range([0, xScale.bandwidth()])
    .padding(PADDING_WITHIN);

  // y
  const minValue = Math.min(mkNumber(min(sortedData, d => getY(d))), 0);
  const maxValue = max(sortedData, d => getY(d)) as number;
  const yScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .range([chartHeight, 0])
    .nice();
  const yAxisLabel =
    measures.find(d => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  const xKey = fields.x.componentIri;

  const wide: Record<string, ObservationValue>[] = [];
  const groupedMap = group(sortedData, getX);
  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce<{ [k: string]: number | string }>(
      (obj, cur) => {
        const currentKey = getSegment(cur);
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
      [xKey]: key
    });
  }

  const maxTotal = max<$FixMe, number>(wide, d => d.total) as number;
  const yStackDomain = [0, maxTotal] as [number, number];

  const stacked = stack().keys(segments);

  const series = stacked(wide as { [key: string]: number }[]);

  const yStackScale = scaleLinear()
    .domain(yStackDomain)
    .range([chartHeight, 0])
    .nice();

  const grouped = [...groupedMap];

  // Tooltip
  const getAnnotationInfo = (datum: Observation): Tooltip => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(Math.max(getY(datum), 0));
    const yAnchor = yRef;

    const yPlacement = yAnchor < chartHeight * 0.33 ? "middle" : "top";

    const getXPlacement = () => {
      if (yPlacement === "top") {
        return xRef < chartWidth * 0.33
          ? "right"
          : xRef > chartWidth * 0.66
          ? "left"
          : "center";
      } else {
        // yPlacement === "middle"
        return xRef < chartWidth * 0.5 ? "right" : "left";
      }
    };
    const xPlacement = getXPlacement();

    const getXAnchor = () => {
      if (yPlacement === "top") {
        return xPlacement === "right"
          ? xRef
          : xPlacement === "center"
          ? xRef + xOffset
          : xRef + xOffset * 2;
      } else {
        // yPlacement === "middle"
        return xPlacement === "right" ? xRef + xOffset * 2 : xRef;
      }
    };
    const xAnchor = getXAnchor();

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: getX(datum),
      datum: {
        label: fields.segment && getSegment(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string
      },
      values: undefined
    };
  };

  return {
    sortedData,
    bounds,
    getX,
    xScale,
    xScaleInteraction,
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
    series,
    getAnnotationInfo
  };
};

const ColumnChartProvider = ({
  data,
  fields,
  measures,
  children
}: Pick<ChartProps, "data" | "measures"> & {
  children: ReactNode;
  fields: ColumnFields;
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
}: Pick<ChartProps, "data" | "measures"> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
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
