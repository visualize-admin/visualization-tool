import {
  ascending,
  extent,
  group,
  max,
  min,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3";
import { ReactNode, useCallback, useEffect, useMemo } from "react";
import { LineFields } from "../../configurator";
import {
  getPalette,
  mkNumber,
  parseDate,
  useFormatFullDateAuto,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { Observation, ObservationValue } from "../../domain/data";
import { sortByIndex } from "../../lib/array";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { useTheme } from "../../themes";
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
import { LEFT_MARGIN_OFFSET } from "./constants";

export interface LinesState {
  chartType: "line";
  data: Observation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  // xUniqueValues: Date[];
  getY: (d: Observation) => number;
  yScale: ScaleLinear<number, number>;
  getSegment: (d: Observation) => string;
  colors: ScaleOrdinal<string, string>;
  xAxisLabel: string;
  yAxisLabel: string;
  grouped: Map<string, Observation[]>;
  chartWideData: ArrayLike<Record<string, ObservationValue>>;
  allDataWide: ArrayLike<Record<string, ObservationValue>>;
  xKey: string;
  getAnnotationInfo: (d: Observation) => TooltipInfo;
}

const useLinesState = ({
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
  fields: LineFields;
  aspectRatio: number;
}): LinesState => {
  const theme = useTheme();
  const width = useWidth();
  const formatNumber = useFormatNumber();
  const formatDateAuto = useFormatFullDateAuto();
  const [
    interactiveFilters,
    dispatchInteractiveFilters,
  ] = useInteractiveFilters();

  // Reset categories to avoid categories with the same
  // name to persist as filters across different dimensions
  // i.e. Jura as forest zone != Jura as canton.
  useEffect(
    () => dispatchInteractiveFilters({ type: "RESET_INTERACTIVE_CATEGORIES" }),
    [dispatchInteractiveFilters, fields.segment]
  );

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

  const sortedData = useMemo(
    () => [...data].sort((a, b) => ascending(getX(a), getX(b))),
    [data, getX]
  );
  const allDataGroupedMap = group(sortedData, getGroups);
  const allDataWide = getWideData({
    groupedMap: allDataGroupedMap,
    getSegment,
    getY,
    xKey,
  });

  // All Data
  const preparedData = usePreparedData({
    legendFilterActive: interactiveFiltersConfig?.legend.active,
    timeFilterActive: interactiveFiltersConfig?.time.active,
    sortedData,
    interactiveFilters,
    getX,
    getSegment,
  });

  const grouped = group(preparedData, getSegment);
  const groupedMap = group(preparedData, getGroups);
  const chartWideData = getWideData({ groupedMap, getSegment, getY, xKey });

  // x
  const xDomain = extent(preparedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xEntireDomain = useMemo(
    () => extent(sortedData, (d) => getX(d)) as [Date, Date],
    [sortedData, getX]
  );
  const xEntireScale = scaleTime().domain(xEntireDomain);

  // This effect initiates the interactive time filter
  // and resets interactive categories filtering
  // FIXME: use presets
  useEffect(() => {
    dispatchInteractiveFilters({
      type: "ADD_TIME_FILTER",
      value: xEntireDomain,
    });
  }, [dispatchInteractiveFilters, xEntireDomain]);

  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.x.componentIri;
  // y
  const minValue = Math.min(mkNumber(min(preparedData, getY)), 0);
  const maxValue = max(preparedData, getY) as number;
  const yDomain = [minValue, maxValue];

  const entireMaxValue = max(sortedData, getY) as number;

  const yScale = scaleLinear().domain(yDomain).nice();
  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  // segments
  const segments = [...new Set(sortedData.map(getSegment))].sort((a, b) =>
    ascending(a, b)
  );
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

  // Dimensions
  const left = interactiveFiltersConfig?.time.active
    ? Math.max(
        estimateTextWidth(formatNumber(entireMaxValue)),
        // Account for width of time slider selection
        estimateTextWidth(formatDateAuto(xEntireScale.domain()[0]), 12) * 2 + 20
      )
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = interactiveFiltersConfig?.time.active
    ? BRUSH_BOTTOM_SPACE
    : 40;
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

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const xAnchor = xScale(getX(datum));
    const yAnchor = yScale(getY(datum));

    const tooltipValues = preparedData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortOrder: "asc",
    });

    const xPlacement = xAnchor < chartWidth * 0.5 ? "right" : "left";

    const yPlacement = "middle";

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: formatDateAuto(getX(datum)),
      datum: {
        label: fields.segment && getSegment(datum),
        value: formatNumber(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        label: getSegment(td),
        value: formatNumber(getY(td)),
        color:
          segments.length > 1
            ? (colors(getSegment(td)) as string)
            : theme.colors.primary,
        yPos: yScale(getY(td)),
      })),
    };
  };
  return {
    chartType: "line",
    data,
    bounds,
    getX,
    xScale,
    xEntireScale,
    // xUniqueValues,
    getY,
    yScale,
    getSegment,
    xAxisLabel,
    yAxisLabel,
    segments,
    colors,
    grouped,
    chartWideData,
    allDataWide,
    xKey,
    getAnnotationInfo,
  };
};

const LineChartProvider = ({
  data,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  children: ReactNode;
  fields: LineFields;
  aspectRatio: number;
}) => {
  const state = useLinesState({
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

export const LineChart = ({
  data,
  fields,
  dimensions,
  measures,
  interactiveFiltersConfig,
  aspectRatio,
  children,
}: Pick<
  ChartProps,
  "data" | "dimensions" | "measures" | "interactiveFiltersConfig"
> & {
  aspectRatio: number;
  fields: LineFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        {/* <InteractiveFiltersProvider> */}
        <LineChartProvider
          data={data}
          fields={fields}
          dimensions={dimensions}
          measures={measures}
          interactiveFiltersConfig={interactiveFiltersConfig}
          aspectRatio={aspectRatio}
        >
          {children}
        </LineChartProvider>
        {/* </InteractiveFiltersProvider> */}
      </InteractionProvider>
    </Observer>
  );
};
