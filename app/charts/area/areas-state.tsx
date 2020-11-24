import {
  ascending,
  descending,
  extent,
  group,
  max,
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
  stackOffsetDiverging,
  stackOrderAscending,
  stackOrderDescending,
  stackOrderReverse,
} from "d3-shape";
import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import { AreaFields } from "../../configurator";
import {
  getPalette,
  parseDate,
  useFormatFullDateAuto,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { Observation, ObservationValue } from "../../domain/data";
import { sortByIndex } from "../../lib/array";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { getWideData } from "../shared/chart-helpers";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { LEFT_MARGIN_OFFSET } from "./constants";

// FIXME: get this from chart config
const WITH_TIME_BRUSH = false;

export interface AreasState {
  data: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  segments: string[];
  colors: ScaleOrdinal<string, string>;
  yAxisLabel: string;
  chartWideData: ArrayLike<Record<string, ObservationValue>>;
  allDataWide: ArrayLike<Record<string, ObservationValue>>;
  series: $FixMe[];
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useAreasState = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  fields: AreaFields;
  aspectRatio: number;
}): AreasState => {
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

  const hasSegment = fields.segment;

  const getGroups = (d: Observation): string =>
    d[fields.x.componentIri] as string;
  const getX = useCallback(
    (d: Observation): Date => parseDate(d[fields.x.componentIri].toString()),
    [fields.x.componentIri]
  );
  const getY = (d: Observation): number => +d[fields.y.componentIri] as number;
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment ? (d[fields.segment.componentIri] as string) : "segment",
    [fields.segment]
  );

  const xKey = fields.x.componentIri;

  /** Data
   * Contains *all* observations, used for brushing
   */
  const sortedData = useMemo(
    () =>
      [...data]
        // Always sort by x first (TemporalDimension)
        .sort((a, b) => ascending(getX(a), getX(b))),
    [data, getX]
  );
  const allDataGroupedMap = group(sortedData, getGroups);
  const allDataWide = getWideData({
    groupedMap: allDataGroupedMap,
    getSegment,
    getY,
    xKey,
  });
  const xUniqueValues = sortedData
    .map((d) => getX(d))
    .filter(
      (date, i, self) =>
        self.findIndex((d) => d.getTime() === date.getTime()) === i
    );

  /** Prepare Data for use in chart
   * !== data used in some other components like Brush
   * based on *all* data observations.
   */
  const { from, to } = interactiveFilters.time;
  const preparedData = useMemo(() => {
    const prepData =
      from && to
        ? sortedData.filter(
            (d) => from && to && getX(d) >= from && getX(d) <= to
          )
        : sortedData;
    return prepData;
  }, [from, to, sortedData, getX]);
  const groupedMap = group(preparedData, getGroups);
  const chartWideData = getWideData({ groupedMap, xKey, getSegment, getY });

  // Apply "categories" end-user-activated interactive filters to the stack
  const { categories } = interactiveFilters;
  const activeInteractiveFilters = Object.keys(categories);
  const interactivelyFilteredData = preparedData.filter(
    (d) => !activeInteractiveFilters.includes(getSegment(d))
  );

  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  /** Ordered segments */
  const segmentSortingType = fields.segment?.sorting?.sortingType;
  const segmentSortingOrder = fields.segment?.sorting?.sortingOrder;

  const segmentsOrderedByName = Array.from(
    new Set(preparedData.map((d) => getSegment(d)))
  ).sort((a, b) =>
    segmentSortingOrder === "asc" ? ascending(a, b) : descending(a, b)
  );

  const segmentsOrderedByTotalValue = [
    ...rollup(
      preparedData,
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

  const activeSegments = segments.filter(
    (s) => !activeInteractiveFilters.includes(s)
  );

  // Stack order
  const stackOrder =
    segmentSortingType === "byTotalSize" && segmentSortingOrder === "asc"
      ? stackOrderAscending
      : segmentSortingType === "byTotalSize" && segmentSortingOrder === "desc"
      ? stackOrderDescending
      : stackOrderReverse;

  const stacked = stack()
    .order(stackOrder)
    .offset(stackOffsetDiverging)
    .keys(activeSegments);

  const series = stacked(chartWideData as { [key: string]: number }[]);

  /** Scales */
  const maxTotal = max<$FixMe, number>(chartWideData, (d) => d.total) as number;
  const yDomain = [0, maxTotal] as [number, number];
  const entireMaxTotalValue = max<$FixMe, number>(
    allDataWide,
    (d) => d.total
  ) as number;

  const xDomain = extent(preparedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xEntireDomain = useMemo(
    () => extent(sortedData, (d) => getX(d)) as [Date, Date],
    [sortedData, getX]
  );
  const xEntireScale = scaleTime().domain(xEntireDomain);

  const yScale = scaleLinear().domain(yDomain).nice();

  // This effect initiates the interactive time filter
  // and resets interactive categories filtering
  // FIXME: use presets
  useEffect(() => {
    dispatchInteractiveFilters({
      type: "ADD_TIME_FILTER",
      value: xEntireDomain,
    });
  }, [dispatchInteractiveFilters, xEntireDomain]);

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

  /** Dimensions */
  const left = WITH_TIME_BRUSH
    ? Math.max(
        estimateTextWidth(formatNumber(entireMaxTotalValue)),
        // Account for width of time slider selection
        estimateTextWidth(formatDateAuto(xEntireScale.domain()[0])) * 2
      )
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = WITH_TIME_BRUSH ? 100 : 40;
  const margins = {
    top: 50,
    right: 40,
    bottom: bottom,
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
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  /** Tooltip */
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xAnchor = xScale(getX(datum));

    const tooltipValues = interactivelyFilteredData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
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

    const yAnchor = yScale(
      cumulativeRulerItemValues[cumulativeRulerItemValues.length - 1]
    );

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement = "middle";

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
    xEntireScale,
    xUniqueValues,
    getY,
    yScale,
    getSegment,
    yAxisLabel,
    segments,
    colors,
    chartWideData,
    allDataWide,
    series,
    getAnnotationInfo,
  };
};

const AreaChartProvider = ({
  data,
  fields,
  measures,
  dimensions,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "fields" | "dimensions" | "measures"> & {
  children: ReactNode;
  aspectRatio: number;
} & { fields: AreaFields }) => {
  const state = useAreasState({
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

export const AreaChart = ({
  data,
  fields,
  measures,
  dimensions,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "fields" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: AreaFields;
  aspectRatio: number;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <InteractiveFiltersProvider>
          <AreaChartProvider
            data={data}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            aspectRatio={aspectRatio}
          >
            {children}
          </AreaChartProvider>
        </InteractiveFiltersProvider>
      </InteractionProvider>
    </Observer>
  );
};
