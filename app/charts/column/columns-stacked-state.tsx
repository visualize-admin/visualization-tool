import {
  ascending,
  descending,
  extent,
  group,
  max,
  min,
  rollup,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
  stack,
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
  sum,
} from "d3";
import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import { ColumnFields, SortingOrder, SortingType } from "../../configurator";
import {
  getPalette,
  parseDate,
  useFormatFullDateAuto,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { Observation, ObservationValue } from "../../domain/data";
import { sortByIndex } from "../../lib/array";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { useLocale } from "../../locales/use-locale";
import { BRUSH_BOTTOM_SPACE } from "../shared/brush";
import { getWideData, usePreparedData } from "../shared/chart-helpers";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "./constants";

export interface StackedColumnsState {
  chartType: "column";
  sortedData: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => string;
  getXAsDate: (d: Observation) => Date;
  xScale: ScaleBand<string>;
  xScaleInteraction: ScaleBand<string>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  chartWideData: ArrayLike<Record<string, ObservationValue>>;
  allDataWide: ArrayLike<Record<string, ObservationValue>>;
  grouped: [string, Record<string, ObservationValue>[]][];
  series: $FixMe[];
  getAnnotationInfo: (d: Observation, orderedSegments: string[]) => TooltipInfo;
}

const useColumnsStackedState = ({
  data,
  fields,
  measures,
  dimensions,
  interactiveFiltersConfig,
  aspectRatio,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  fields: ColumnFields;
  aspectRatio: number;
}): StackedColumnsState => {
  const locale = useLocale();
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const formatDateAuto = useFormatFullDateAuto();

  const [
    interactiveFilters,
    dispatchInteractiveFilters,
  ] = useInteractiveFilters();

  useEffect(
    () => dispatchInteractiveFilters({ type: "RESET_INTERACTIVE_CATEGORIES" }),
    [dispatchInteractiveFilters, fields.segment]
  );

  const getX = useCallback(
    (d: Observation): string => d[fields.x.componentIri] as string,
    [fields.x.componentIri]
  );
  const getXAsDate = useCallback(
    (d: Observation): Date => parseDate(d[fields.x.componentIri].toString()),
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
  const xKey = fields.x.componentIri;

  // All Data
  const sortingType = fields.x.sorting?.sortingType;
  const sortingOrder = fields.x.sorting?.sortingOrder;

  const allDataGroupedMap = group(data, getX);
  const allDataWide = getWideData({
    groupedMap: allDataGroupedMap,
    getSegment,
    getY,
    xKey,
  });
  const xOrder = allDataWide
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

  // Data for Chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData,
    interactiveFilters,
    getX: getXAsDate,
    getSegment,
  });

  const groupedMap = group(preparedData, getX);
  const chartWideData = getWideData({ groupedMap, xKey, getSegment, getY });

  //Ordered segments
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const segmentsOrderedByName = Array.from(
    new Set(sortedData.map((d) => getSegment(d)))
  ).sort((a, b) =>
    segmentSortingOrder === "asc"
      ? a.localeCompare(b, locale)
      : b.localeCompare(a, locale)
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

  // Scales
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
  const bandDomain = [...new Set(preparedData.map((d) => getX(d) as string))];
  const xScale = scaleBand()
    .domain(bandDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);
  const xScaleInteraction = scaleBand()
    .domain(bandDomain)
    .paddingInner(0)
    .paddingOuter(0);

  // x as time, needs to be memoized!
  const xEntireDomainAsTime = useMemo(
    () => extent(sortedData, (d) => getXAsDate(d)) as [Date, Date],
    [getXAsDate, sortedData]
  );
  const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

  // y
  const minTotal = Math.min(
    min<$FixMe, number>(chartWideData, (d) => d.total) as number,
    0
  );
  const maxTotal = max<$FixMe, number>(chartWideData, (d) => d.total) as number;
  const yStackDomain = [minTotal, maxTotal] as [number, number];
  const entireMaxTotalValue = max<$FixMe, number>(
    allDataWide,
    (d) => d.total
  ) as number;

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

  const stacked = stack()
    .order(stackOrder)
    .offset(stackOffsetDiverging)
    .keys(segments);

  const series = stacked(
    chartWideData as {
      [key: string]: number;
    }[]
  );

  // Dimensions
  const left = interactiveFiltersConfig?.time.active
    ? Math.max(
        estimateTextWidth(formatNumber(entireMaxTotalValue)),
        // Account for width of time slider selection
        estimateTextWidth(formatDateAuto(xEntireScale.domain()[0]), 12) * 2 + 20
      )
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = interactiveFiltersConfig?.time.active
    ? (max(bandDomain, (d) => estimateTextWidth(d)) || 70) + BRUSH_BOTTOM_SPACE
    : max(bandDomain, (d) => estimateTextWidth(d)) || 70;
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
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Tooltips
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xRef = xScale(getX(datum)) as number;
    const xOffset = xScale.bandwidth() / 2;

    const tooltipValues = preparedData.filter((j) => getX(j) === getX(datum));

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
    chartType: "column",
    sortedData,
    bounds,
    getX,
    getXAsDate,
    xScale,
    xScaleInteraction,
    xEntireScale,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    chartWideData,
    allDataWide,
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
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  fields: ColumnFields;
  aspectRatio: number;
}) => {
  const state = useColumnsStackedState({
    data,
    fields,
    dimensions,
    interactiveFiltersConfig,
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
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  aspectRatio: number;
  children: ReactNode;
  fields: ColumnFields;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <InteractiveFiltersProvider>
          <StackedColumnsChartProvider
            data={data}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            interactiveFiltersConfig={interactiveFiltersConfig}
            aspectRatio={aspectRatio}
          >
            {children}
          </StackedColumnsChartProvider>
        </InteractiveFiltersProvider>
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
