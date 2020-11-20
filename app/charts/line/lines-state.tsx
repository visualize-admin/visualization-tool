import { ascending, extent, group, max, min } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3-scale";

import React, { ReactNode, useCallback, useEffect, useMemo } from "react";
import { Observation, ObservationValue } from "../../domain/data";
import {
  getPalette,
  mkNumber,
  parseDate,
  useFormatFullDateAuto,
  useFormatNumber,
} from "../../configurator/components/ui-helpers";
import { sortByIndex } from "../../lib/array";
import { estimateTextWidth } from "../../lib/estimate-text-width";
import { useTheme } from "../../themes";
import { TooltipInfo } from "../shared/interaction/tooltip";
import { LEFT_MARGIN_OFFSET } from "./constants";
import { ChartContext, ChartProps } from "../shared/use-chart-state";
import { InteractionProvider } from "../shared/use-interaction";
import { Bounds, Observer, useWidth } from "../shared/use-width";
import { LineFields } from "../../configurator";
import {
  InteractiveFiltersProvider,
  useInteractiveFilters,
} from "../shared/use-interactive-filters";
import { getWideData } from "../shared/chart-helpers";
import { BRUSH_HEIGHT } from "../shared/brush";

export interface LinesState {
  data: Observation[];
  bounds: Bounds;
  segments: string[];
  getX: (d: Observation) => Date;
  xScale: ScaleTime<number, number>;
  xEntireScale: ScaleTime<number, number>;
  xUniqueValues: Date[];
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
  aspectRatio,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
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

  useEffect(
    () => dispatchInteractiveFilters({ type: "RESET_INTERACTIVE_FILTERS" }),
    [dispatchInteractiveFilters, fields.segment]
  );

  const getGroups = (d: Observation): string =>
    d[fields.x.componentIri] as string;
  const getX = useCallback(
    (d: Observation): Date => parseDate(d[fields.x.componentIri].toString()),
    [fields.x.componentIri]
  );
  const getY = (d: Observation): number => +d[fields.y.componentIri] as number;
  const getSegment = (d: Observation): string =>
    fields.segment ? (d[fields.segment.componentIri] as string) : "fixme";

  const xKey = fields.x.componentIri;

  /** Data
   * Contains *all* observations, used for brushing
   */
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

  const grouped = group(preparedData, getSegment);
  const groupedMap = group(preparedData, getGroups);
  const chartWideData = getWideData({ groupedMap, getSegment, getY, xKey });

  // Apply "categories" end-user-activated interactive filters to the stack
  const { categories } = interactiveFilters;
  const activeInteractiveFilters = Object.keys(categories);

  const interactivelyFilteredData = preparedData.filter(
    (d) => !activeInteractiveFilters.includes(getSegment(d))
  );

  // x
  const xDomain = extent(preparedData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xEntireDomain = extent(sortedData, (d) => getX(d)) as [Date, Date];
  const xEntireScale = scaleTime().domain(xEntireDomain);

  const xAxisLabel =
    measures.find((d) => d.iri === fields.x.componentIri)?.label ??
    fields.x.componentIri;
  // y
  const minValue = Math.min(mkNumber(min(preparedData, getY)), 0);
  const maxValue = max(preparedData, getY) as number;
  const yDomain = [minValue, maxValue];

  const yScale = scaleLinear().domain(yDomain).nice();
  const yAxisLabel =
    measures.find((d) => d.iri === fields.y.componentIri)?.label ??
    fields.y.componentIri;

  // segments
  const segments = [...new Set(preparedData.map(getSegment))].sort((a, b) =>
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
  const left = Math.max(
    estimateTextWidth(formatNumber(yScale.domain()[0])),
    estimateTextWidth(formatNumber(yScale.domain()[1]))
  );
  const margins = {
    top: 50,
    right: 40,
    bottom: 100,
    left: left + LEFT_MARGIN_OFFSET,
  };
  const chartWidth = width - margins.left - margins.right;
  const chartHeight = chartWidth * aspectRatio;
  const bounds = {
    width,
    height: chartHeight + margins.top + margins.bottom + BRUSH_HEIGHT,
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

    const tooltipValues = interactivelyFilteredData.filter(
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
    data,
    bounds,
    getX,
    xScale,
    xEntireScale,
    xUniqueValues,
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
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  children: ReactNode;
  fields: LineFields;
  aspectRatio: number;
}) => {
  const state = useLinesState({
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

export const LineChart = ({
  data,
  fields,
  dimensions,
  measures,
  aspectRatio,
  children,
}: Pick<ChartProps, "data" | "dimensions" | "measures"> & {
  aspectRatio: number;
  fields: LineFields;
  children: ReactNode;
}) => {
  return (
    <Observer>
      <InteractionProvider>
        <InteractiveFiltersProvider>
          <LineChartProvider
            data={data}
            fields={fields}
            dimensions={dimensions}
            measures={measures}
            aspectRatio={aspectRatio}
          >
            {children}
          </LineChartProvider>
        </InteractiveFiltersProvider>
      </InteractionProvider>
    </Observer>
  );
};
