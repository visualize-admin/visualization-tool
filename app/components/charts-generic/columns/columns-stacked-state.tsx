import { ascending, descending, group, max, min, rollup, sum } from "d3-array";
import {
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
} from "d3-scale";
import {
  stack,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
} from "d3-shape";
import * as React from "react";
import { ReactNode, useCallback, useMemo } from "react";
import {
  ColumnFields,
  SortingOrder,
  SortingType,
} from "../../../domain/config-types";
import { Observation, ObservationValue } from "../../../domain/data";
import { getPalette, isNumber, useFormatNumber } from "../../../domain/helpers";
import { sortByIndex } from "../../../lib/array";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { Tooltip } from "../interaction/tooltip";
import { PADDING_INNER, PADDING_OUTER ,BOTTOM_MARGIN_OFFSET, LEFT_MARGIN_OFFSET} from "./constants";

import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";
import { Bounds, Observer, useWidth } from "../use-width";

export interface StackedColumnsState {
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  wide: Record<string, ObservationValue>[];
  grouped: [string, Record<string, ObservationValue>[]][];
  series: $FixMe[];
  getAnnotationInfo: (d: Observation, orderedSegments: string[]) => Tooltip;
}

const useColumnsStackedState = ({
  data,
  fields,
  measures,
  dimensions,
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: ColumnFields;
  aspectRatio: number;
}): StackedColumnsState => {
  const width = useWidth();
  const formatNumber = useFormatNumber();

  const getX = useCallback(
    (d: Observation): string => d[fields.x.componentIri] as string,
    [fields.x.componentIri]
  );
  const getY = useCallback(
    (d: Observation): number => +d[fields.y.componentIri],
    [fields.y.componentIri]
  );
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment && fields.segment.componentIri
        ? (d[fields.segment.componentIri] as string)
        : "segment",
    [fields.segment]
  );

  // data / groups for stack
  const xKey = fields.x.componentIri;
  const wide: Record<string, ObservationValue>[] = [];
  const groupedMap = group(data, getX);
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

  // Sort
  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  const xOrder = wide
    .sort((a, b) => ascending(a.total, b.total))
    .map((d, i) => getX(d));

  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getX,
        getY,
        sortingType,
        sortingOrder,
        xOrder,
      }),
    [data, getX, getY, sortingType, sortingOrder, xOrder]
  );

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

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();
  const segmentDimension = dimensions.find(
    (d) => d.iri === fields.segment?.componentIri
  ) as $FixMe;

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = segments.map((segment) => {
      const dvIri = segmentDimension.values.find(
        (s: $FixMe) => s.label === segment
      ).value;

      return {
        label: segment,
        color: fields.segment?.colorMapping![dvIri] || "#006699",
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(segments);
    colors.range(getPalette(fields.segment?.palette));
  }

  // x
  const bandDomain = [...new Set(sortedData.map((d) => getX(d) as string))];
  const xScale = scaleBand()
    .domain(bandDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);
  const xScaleInteraction = scaleBand()
    .domain(bandDomain)
    .paddingInner(0)
    .paddingOuter(0);

  // y
  const minTotal = Math.min(
    min<$FixMe, number>(wide, (d) => d.total) as number,
    0
  );
  const maxTotal = max<$FixMe, number>(wide, (d) => d.total) as number;
  const yStackDomain = [minTotal, maxTotal] as [number, number];
  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  const yScale = scaleLinear().domain(yStackDomain).nice();

  // stack order
  const stackOrder =
    segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
      ? stackOrderAscending
      : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
      ? stackOrderDescending
      : // Reverse segments here, so they're sorted from top to bottom
        stackOrderReverse;
  // stack logic
  const stacked = stack()
    .order(stackOrder)
    .offset(stackOffsetDiverging)
    .keys(segments);

  const series = stacked(
    wide as {
      [key: string]: number;
    }[]
  );

  // Dimensions
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(formatNumber(yScale.domain()[1]))
  );
  const bottom = max(bandDomain, (d) => estimateTextWidth(d)) || 70;
  const margins = {
    top: 50,
    right: 40,
    bottom: bottom + BOTTOM_MARGIN_OFFSET,
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
  xScaleInteraction.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): Tooltip => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;

    const tooltipValues = sortedData.filter((j) => getX(j) === getX(datum));

    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortOrder: "asc",
    });

    const cumulativeSum = ((sum) => (d: Observation) => (sum += getY(d)))(0);
    const cumulativeRulerItemValues = [
      ...sortedTooltipValues.map(cumulativeSum),
    ];

    const yRef = yScale(
      Math.max(
        cumulativeRulerItemValues[cumulativeRulerItemValues.length - 1],
        0
      )
    );
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
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegment(td),
        value: formatNumber(getY(td)),
        color: colors(getSegment(td)) as string,
      })),
    };
  };

  return {
    sortedData,
    bounds,
    getX,
    xScale,
    xScaleInteraction,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    wide,
    grouped: [...groupedMap],
    series,
    getAnnotationInfo,
  };
};

const StackedColumnsChartProvider = ({
  data,
  fields,
  measures,
  dimensions,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useColumnsStackedState({
    data,
    fields,
    dimensions,
    measures,
    aspectRatio,
  });
  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const StackedColumnsChart = ({
  data,
  fields,
  measures,
  dimensions,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <StackedColumnsChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </StackedColumnsChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  getY,
  sortingType,
  sortingOrder,
  xOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  getY: (d: Observation) => number;
  sortingType: SortingType | undefined;
  sortingOrder: SortingOrder | undefined;
  xOrder: string[];
}) => {
  if (sortingOrder === "desc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (sortingOrder === "asc" && sortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (sortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: xOrder,
      getCategory: getX,
      sortOrder: sortingOrder,
    });

    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
