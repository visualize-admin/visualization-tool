import { ascending, descending, group, max, min, rollup, sum } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3-scale";
import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import {
  BarFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { GenericObservation, ObservationValue } from "../../../domain/data";
import {
  getOpacityRanges,
  getPalette,
  mkNumber,
} from "../../../domain/helpers";
import { sortByIndex } from "../../../lib/array";
import {
  BAR_HEIGHT,
  BAR_SPACE_ON_TOP,
  BOTTOM_MARGIN_OFFSET,
} from "../constants";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export interface GroupedBarsState {
  sortedData: GenericObservation[];
  bounds: Bounds;
  getX: (d: GenericObservation) => number;
  xScale: ScaleLinear<number, number>;
  getY: (d: GenericObservation) => string;
  yScale: ScaleBand<string>;
  yScaleIn: ScaleBand<string>;
  getSegment: (d: GenericObservation) => string;
  getLabel: (d: GenericObservation) => string;
  getColor: (d: GenericObservation) => string;
  getOpacity: (d: GenericObservation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  opacityScale: ScaleOrdinal<string, number>;
  grouped: [string, Record<string, ObservationValue>[]][];
}

const useGroupedBarsState = ({
  data,
  fields,
  dimensions,
  measures,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: BarFields;
}): GroupedBarsState => {
  const width = useWidth();
  const getX = useCallback(
    (d: GenericObservation) => d[fields.x.componentIri] as number,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: GenericObservation) => d[fields.y.componentIri] as string,
    [fields.y.componentIri]
  );
  const getSegment = useCallback(
    (d: GenericObservation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );
  const getLabel = useCallback(
    (d: GenericObservation): string =>
      fields.label && fields.label.componentIri
        ? (d[fields.label.componentIri] as string)
        : "label",
    [fields.label]
  );
  const getColor = useCallback(
    (d: GenericObservation): string =>
      fields.style && fields.style.colorAcc
        ? (d[fields.style.colorAcc] as string)
        : "entity",
    [fields.style]
  );
  const getOpacity = useCallback(
    (d: GenericObservation): string =>
      fields.style && fields.style.opacityAcc
        ? (d[fields.style.opacityAcc] as string)
        : "period",
    [fields.style]
  );

  // Sort
  const ySortingType = fields.y.sorting?.sortingType;
  const ySortingOrder = fields.y.sorting?.sortingOrder;

  const yOrder = [
    ...rollup(
      data,
      (v) => sum(v, (x) => getX(x)),
      (x) => getY(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getY,
        ySortingType,
        ySortingOrder,
        yOrder,
      }),
    [data, getX, ySortingType, ySortingOrder, yOrder]
  );

  // segments ordered
  const segments = sortedData
    .sort(
      (a, b) =>
        ascending(getColor(a), getColor(b)) ||
        descending(getOpacity(a), getOpacity(b)) ||
        // ascending(a.municipality, b.municipality) ||
        descending(getX(a), getX(b))
    )
    .map((d) => getSegment(d));

  // Colors (shouldn't be segments!)
  const colorDomain = fields.style?.colorDomain
    ? fields.style?.colorDomain
    : segments;
  const colors = scaleOrdinal<string, string>()
    .domain(colorDomain)
    .range(getPalette(fields.segment?.palette));

  // opacity
  const opacityDomain = fields.style?.opacityDomain
    ? fields.style?.opacityDomain
    : [];

  const opacityScale = scaleOrdinal<string, number>()
    .domain(opacityDomain.sort((a, b) => descending(a, b)))
    .range(getOpacityRanges(opacityDomain.length));

  // x
  const minValue = Math.min(mkNumber(min(sortedData, (d) => getX(d))), 0);
  const maxValue = max(sortedData, (d) => getX(d)) as number;
  const xScale = scaleLinear().domain(fields.x.domain).nice();

  // Group
  const groupedMap = group(sortedData, getY);
  const grouped = [...groupedMap];

  // y
  const bandDomain = [...new Set(sortedData.map((d) => getY(d) as string))];
  const chartHeight =
    bandDomain.length * (BAR_HEIGHT * segments.length + BAR_SPACE_ON_TOP);

  const yScale = scaleBand<string>().domain(bandDomain).range([0, chartHeight]);

  const yScaleIn = scaleBand()
    .domain(segments)
    .range([0, BAR_HEIGHT * segments.length]);

  // sort by segments
  grouped.forEach((group) => {
    return [
      group[0],
      sortByIndex({
        data: group[1],
        order: segments,
        getCategory: getSegment,
      }),
    ];
  });

  const margins = {
    top: 0,
    right: 40,
    bottom: BOTTOM_MARGIN_OFFSET,
    left: 0,
  };
  const chartWidth = width - margins.left - margins.right;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom,
    margins,
    chartWidth,
    chartHeight,
  };

  xScale.range([0, chartWidth]);

  return {
    sortedData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    yScaleIn,
    getSegment,
    getLabel,
    getColor,
    getOpacity,
    segments,
    colors,
    opacityScale,
    grouped,
  };
};

const GroupedBarsChartProvider = ({
  data,
  fields,
  dimensions,
  measures,

  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  const state = useGroupedBarsState({
    data,
    fields,
    dimensions,
    measures,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const GroupedBarsChart = ({
  data,
  fields,
  dimensions,
  measures,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: BarFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <GroupedBarsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
        >
          {children}
        </GroupedBarsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getY,
  ySortingType,
  ySortingOrder,
  yOrder,
}: {
  data: GenericObservation[];
  getY: (d: GenericObservation) => string;
  ySortingType: SortingType | undefined;
  ySortingOrder: SortingOrder | undefined;
  yOrder: string[];
}) => {
  if (ySortingOrder === "desc" && ySortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getY(a), getY(b)));
  } else if (ySortingOrder === "asc" && ySortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  } else if (ySortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: yOrder,
      getCategory: getY,
      sortOrder: ySortingOrder,
    });
    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getY(a), getY(b)));
  }
};
