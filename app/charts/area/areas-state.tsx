import {
  ascending,
  descending,
  extent,
  group,
  max,
  min,
  rollup,
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
import { ReactNode, useCallback, useMemo } from "react";
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
import { useLocale } from "../../locales/use-locale";
import { BRUSH_BOTTOM_SPACE } from "../shared/brush";
import { getWideData, usePreparedData } from "../shared/chart-helpers";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { useInteractiveFilters } from "../shared/use-interactive-filters";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { LEFT_MARGIN_OFFSET } from "./constants";

export interface AreasState {
  chartType: "area";
  data: Observation[];
  bounds: Bounds;
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  getY: (d: Observation) => number | null;
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
  interactiveFiltersConfig,
  aspectRatio,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  fields: AreaFields;
  aspectRatio: number;
}): AreasState => {
  const locale = useLocale();
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const formatDateAuto = useFormatFullDateAuto();
  const [interactiveFilters] = useInteractiveFilters();

  const hasSegment = fields.segment;

  const getGroups = (d: Observation): string =>
    d[fields.x.componentIri] as string;
  const getX = useCallback(
    (d: Observation): Date => parseDate(`${d[fields.x.componentIri]}`),
    [fields.x.componentIri]
  );
  const getY = (d: Observation): number | null => {
    const v = d[fields.y.componentIri];
    return v !== null ? +v : null;
  };
  const getSegment = useCallback(
    (d: Observation): string =>
      fields.segment ? (d[fields.segment.componentIri] as string) : "segment",
    [fields.segment]
  );

  const xKey = fields.x.componentIri;
  const hasInteractiveTimeFilter = useMemo(
    () => interactiveFiltersConfig?.time.active,
    [interactiveFiltersConfig?.time.active]
  );

  // All Data (used for brushing)
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

  // Data for chart
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData,
    interactiveFilters,
    getX,
    getSegment,
  });

  const groupedMap = group(preparedData, getGroups);
  const chartWideData = getWideData({ groupedMap, xKey, getSegment, getY });

  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  /** Ordered segments */
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
    .keys(segments);

  const series = stacked(chartWideData as { [key: string]: number }[]);

  /** Scales */
  const minTotal = min(series, (d) => min(d, (d) => d[0])) ?? 0;
  const maxTotal = max(series, (d) => max(d, (d) => d[1])) ?? NaN;
  const yDomain = [minTotal, maxTotal];

  const entireMaxTotalValue = (max<$FixMe>(
    allDataWide,
    (d) => d.total ?? 0
  ) as unknown) as number;

  const xDomain = extent(preparedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xEntireDomain = useMemo(
    () => extent(sortedData, (d) => getX(d)) as [Date, Date],
    [sortedData, getX]
  );
  const xEntireScale = scaleTime().domain(xEntireDomain);

  const yScale = scaleLinear().domain(yDomain).nice();

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
  const left = hasInteractiveTimeFilter
    ? estimateTextWidth(formatNumber(entireMaxTotalValue))
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = hasInteractiveTimeFilter ? BRUSH_BOTTOM_SPACE : 40;

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

    const tooltipValues = preparedData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortOrder: "asc",
    });
    const cumulativeSum = ((sum) => (d: Observation) => (sum += getY(d) ?? 0))(
      0
    );
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
    chartType: "area",
    data,
    bounds,
    getX,
    xScale,
    xEntireScale,
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
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "fields" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  aspectRatio: number;
} & { fields: AreaFields }) => {
  const state = useAreasState({
    data,
    fields,
    dimensions,
    measures,
    interactiveFiltersConfig,
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
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "fields" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
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
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </AreaChartProvider>
      </InteractionProvider>
    </Observer>
  );
};
