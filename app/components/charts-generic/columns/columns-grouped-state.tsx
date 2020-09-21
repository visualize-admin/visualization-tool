import { ascending, group, max, min, rollup, sum, descending } from "d3-array";
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
  ColumnFields,
  Observation,
  ObservationValue,
  SortingType,
  SortingOrder,
} from "../../../domain";
import { getPalette, mkNumber, useFormatNumber } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { Tooltip } from "../interaction/tooltip";
import {
  PADDING_INNER,
  PADDING_OUTER,
  PADDING_WITHIN,
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET
} from "./constants";
import { Bounds, Observer, useWidth } from "../use-width";
import { ChartContext, ChartProps } from "../use-chart-state";
import { InteractionProvider } from "../use-interaction";

import { sortByIndex } from "../../../lib/array";

export interface GroupedColumnsState {
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  xScaleIn: ScaleBand<string>;
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  grouped: [string, Record<string, ObservationValue>[]][];
  getAnnotationInfo: (d: Observation) => Tooltip;
}

const useGroupedColumnsState = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: ColumnFields;
  aspectRatio: number;
}): GroupedColumnsState => {
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

  // Sort
  const xSortingType = fields.x.sorting?.sortingType;
  const xSortingOrder = fields.x.sorting?.sortingOrder;

  const xOrder = [
    ...rollup(
      data,
      (v) => sum(v, (x) => getY(x)),
      (x) => getX(x)
    ),
  ]
    .sort((a, b) => ascending(a[1], b[1]))
    .map((d) => d[0]);

  const sortedData = useMemo(
    () =>
      sortData({
        data,
        getX,
        xSortingType,
        xSortingOrder,
        xOrder,
      }),
    [data, getX, xSortingType, xSortingOrder, xOrder]
  );
  // segments
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

  // const inBandDomain = [...new Set(sortedData.map(getSegment))];
  const xScaleIn = scaleBand().domain(segments).padding(PADDING_WITHIN);

  // y
  const minValue = Math.min(mkNumber(min(sortedData, (d) => getY(d))), 0);
  const maxValue = max(sortedData, (d) => getY(d)) as number;
  const yScale = scaleLinear()
    .domain([mkNumber(minValue), mkNumber(maxValue)])
    .nice();
  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  // Group
  const groupedMap = group(sortedData, getX);
  const grouped = [...groupedMap];

  // sort by segments
  grouped.forEach((group) => {
    return [
      group[0],
      sortByIndex({
        data: group[1],
        order: segments,
        getCategory: getSegment,
        sortOrder: segmentSortingOrder,
      }),
    ];
  });

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
  xScaleIn.range([0, xScale.bandwidth()]);
  yScale.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (datum: Observation): Tooltip => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(getY(datum));
    const yAnchor = yRef;

    const tooltipValues = data.filter((j) => getX(j) === getX(datum));
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      // Always ascending to match visual order of colors of the stack
      sortOrder: "asc",
    });

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
    xScaleIn,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    grouped,
    getAnnotationInfo,
  };
};

const GroupedColumnChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useGroupedColumnsState({
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

export const GroupedColumnChart = ({
  data,
  fields,
  dimensions,
  measures,
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
        <GroupedColumnChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          aspectRatio={aspectRatio}
        >
          {children}
        </GroupedColumnChartProvider>
      </InteractionProvider>
    </Observer>
  );
};

const sortData = ({
  data,
  getX,
  xSortingType,
  xSortingOrder,
  xOrder,
}: {
  data: Observation[];
  getX: (d: Observation) => string;
  xSortingType: SortingType | undefined;
  xSortingOrder: SortingOrder | undefined;
  xOrder: string[];
}) => {
  if (xSortingOrder === "desc" && xSortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => descending(getX(a), getX(b)));
  } else if (xSortingOrder === "asc" && xSortingType === "byDimensionLabel") {
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  } else if (xSortingType === "byMeasure") {
    const sd = sortByIndex({
      data,
      order: xOrder,
      getCategory: getX,
      sortOrder: xSortingOrder,
    });
    return sd;
  } else {
    // default to scending alphabetical
    return [...data].sort((a, b) => ascending(getX(a), getX(b)));
  }
};
