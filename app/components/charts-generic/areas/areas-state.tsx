import {
  ascending,
  extent,
  group,
  max,
  descending,
  rollup,
  sum,
} from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3-scale";
import {
  stack,
  stackOrderNone,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
} from "d3-shape";
import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import { AreaFields, Observation, FIELD_VALUE_NONE } from "../../../domain";
import {
  formatNumber,
  formatDateAuto,
  getPalette,
  isNumber,
  parseDate,
} from "../../../domain/helpers";
import { Tooltip } from "../annotations/tooltip";
import { Bounds, Observer, useWidth } from "../use-width";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { useTheme } from "../../../themes";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { LEFT_MARGIN_OFFSET } from "../constants";
import { sortByIndex } from "../../../lib/array";

export interface AreasState {
  data: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  wide: { [key: string]: number | string }[];
  series: $FixMe[];
  getAnnotationInfo: (d: Observation) => Tooltip;
}

const useAreasState = ({
  data,
  fields,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "measures"> & {
  fields: AreaFields;
  aspectRatio: number;
}): AreasState => {
  const theme = useTheme();

  const width = useWidth();

  const hasSegment =
    fields.segment && fields.segment.componentIri !== FIELD_VALUE_NONE;

  const getGroups = (d: Observation): string =>
    d[fields.x.componentIri] as string;
  const getX = useCallback(
    (d: Observation): Date => parseDate(d[fields.x.componentIri].toString()),
    [fields.x.componentIri]
  );
  const getY = (d: Observation): number => +d[fields.y.componentIri] as number;
  const getSegment = (d: Observation): string =>
    fields.segment && fields.segment.componentIri !== FIELD_VALUE_NONE
      ? (d[fields.segment.componentIri] as string)
      : "segment";

  // data / groups for stack
  // Always sort by x first (TemporalDimension)
  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(getX(a), getX(b))),

    [data, getX]
  );

  const xKey = fields.x.componentIri;
  const wide: { [key: string]: number | string }[] = [];
  const groupedMap = group(sortedData, getGroups);

  for (const [key, values] of groupedMap) {
    const keyObject = values.reduce<{ [k: string]: number | string }>(
      (obj, cur) => {
        const currentKey = getSegment(cur);
        const currentY = isNumber(getY(cur)) ? getY(cur) : 0;
        const total = currentY + (obj.total as number);
        return {
          ...obj,
          [currentKey]: getY(cur),
          total,
        };
      },
      { total: 0 }
    );
    wide.push({
      ...keyObject,
      [xKey]: key,
    });
  }

  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  // ordered segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const segmentsOrderedByName = Array.from(
    new Set(sortedData.map((d) => getSegment(d)))
  ).sort((a, b) =>
    segmentSortingOrder === "asc" ? ascending(a, b) : descending(a, b)
  );

  const segmentsOrderedByTotalValue = [
    ...rollup(
      sortedData,
      (v) => sum(v, (x) => getY(x)),
      (x) => getSegment(x)
    ),
  ]
    .sort((a, b) =>
      segmentSortingOrder === "asc"
        ? ascending(a[1], b[1])
        : descending(a[1], b[1])
    )
    .map((d) => d[0]);

  const segments =
    segmentSortingType === "byDimensionLabel"
      ? segmentsOrderedByName
      : segmentsOrderedByTotalValue;

  const maxTotal = max<$FixMe, number>(wide, (d) => d.total) as number;
  const yDomain = [0, maxTotal] as [number, number];

  // stack order
  const stackOrder =
    segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
      ? stackOrderAscending
      : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
      ? stackOrderDescending
      : stackOrderNone;
  // Sstack logic
  const stacked = stack()
    .order(stackOrder)
    .offset(stackOffsetDiverging)
    .keys(segments);
  const series = stacked(wide as { [key: string]: number }[]);

  const xUniqueValues = data
    .map((d) => getX(d))
    .filter(
      (date, i, self) =>
        self.findIndex((d) => d.getTime() === date.getTime()) === i
    );

  const xDomain = extent(data, (d) => getX(d)) as [Date, Date];

  const xScale = scaleTime().domain(xDomain);

  const yScale = scaleLinear()
    .domain(yDomain)
    .nice();

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
    bottom: 40,
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
    const xAnchor = xScale(getX(datum));

    const tooltipValues = sortedData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always descending to match visual order of colors of the stack
      sortOrder: "desc",
    });
    console.log({ sortedTooltipValues });
    const cumulativeSum = ((sum) => (d: Observation) => (sum += getY(d)))(0);
    const cumulativeRulerItemValues = [
      ...sortedTooltipValues.map(cumulativeSum),
    ];

    const yAnchor = yScale(
      cumulativeRulerItemValues[cumulativeRulerItemValues.length - 1]
    );

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement = "middle";
    // yAnchor > chartHeight * 0.33
    //   ? "top"
    //   : yAnchor < chartHeight * 0.66
    //   ? "bottom"
    //   : "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatDateAuto(getX(datum)),
      datum: {
        label: hasSegment ? getSegment(datum) : undefined,
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: hasSegment
        ? sortedTooltipValues.map((td) => ({
            label: getSegment(td),
            value: formatNumber(getY(td)),
            color: colors(getSegment(td)) as string,
          }))
        : undefined,
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
    yAxisLabel,
    segments,
    colors,
    wide,
    series,
    getAnnotationInfo,
  };
};

const AreaChartProvider = ({
  data,
  fields,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
  aspectRatio: number;
} & { fields: AreaFields }) => {
  const state = useAreasState({
    data,
    fields,
    measures,
    aspectRatio,
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
  children,
}: Pick<ChartProps, "data" | "fields" | "measures"> & {
  children: ReactNode;
  fields: AreaFields;
  aspectRatio: number;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <AreaChartProvider
          data={data}
          fields={fields}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </AreaChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
