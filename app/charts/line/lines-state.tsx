import {
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
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import { LEFT_MARGIN_OFFSET } from "@/charts/line/constants";
import {
  LinesStateVariables,
  useLinesStateData,
  useLinesStateVariables,
} from "@/charts/line/lines-state-props";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import { getWideData } from "@/charts/shared/chart-helpers";
import { ChartStateData, CommonChartState } from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext } from "@/charts/shared/use-chart-state";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
import { LineConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import { estimateTextWidth } from "@/utils/estimate-text-width";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";

import { ChartProps } from "../shared/ChartProps";

export type LinesState = CommonChartState &
  LinesStateVariables & {
    chartType: "line";
    segments: string[];
    xScale: ScaleTime<number, number>;
    xEntireScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    grouped: Map<string, Observation[]>;
    chartWideData: ArrayLike<Observation>;
    allDataWide: Observation[];
    xKey: string;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useLinesState = (
  chartProps: ChartProps<LineConfig> & { aspectRatio: number },
  variables: LinesStateVariables,
  data: ChartStateData
): LinesState => {
  const { chartConfig, aspectRatio } = chartProps;
  const {
    xDimension,
    getX,
    getXAsString,
    yMeasure,
    getY,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
  } = variables;
  const { chartData, scalesData, segmentData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();
  const formatters = useChartFormatters(chartProps);

  // TODO: extract to variables
  const xKey = fields.x.componentIri;

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const dataGroupedByX = useMemo(
    () => group(chartData, getXAsString),
    [chartData, getXAsString]
  );

  const allDataWide = getWideData({
    dataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  const preparedDataGroupedBySegment = useMemo(
    () => group(chartData, getSegment),
    [chartData, getSegment]
  );

  const preparedDataGroupedByX = useMemo(
    () => group(chartData, getXAsString),
    [chartData, getXAsString]
  );

  const chartWideData = getWideData({
    dataGroupedByX: preparedDataGroupedByX,
    xKey,
    getY,
    getSegment,
  });

  // x
  const xDomain = extent(chartData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xEntireDomain = useMemo(
    () => extent(scalesData, (d) => getX(d)) as [Date, Date],
    [scalesData, getX]
  );
  const xEntireScale = scaleTime().domain(xEntireDomain);

  // y
  const minValue = Math.min(min(scalesData, getY) ?? 0, 0);
  const maxValue = max(scalesData, getY) ?? 0;
  const yDomain = [minValue, maxValue];

  const entireMaxValue = max(scalesData, getY) as number;
  const yScale = scaleLinear().domain(yDomain).nice();

  // segments
  const segmentFilter = segmentDimension?.iri
    ? chartConfig.filters[segmentDimension?.iri]
    : undefined;
  const { allSegments, segments } = useMemo(() => {
    const allUniqueSegments = Array.from(new Set(segmentData.map(getSegment)));
    const uniqueSegments = Array.from(new Set(scalesData.map(getSegment)));
    const sorting = fields?.segment?.sorting;
    const sorters = makeDimensionValueSorters(segmentDimension, {
      sorting,
      useAbbreviations: fields.segment?.useAbbreviations,
      dimensionFilter: segmentFilter,
    });
    const allSegments = orderBy(
      allUniqueSegments,
      sorters,
      getSortingOrders(sorters, fields.segment?.sorting)
    );

    return {
      allSegments,
      segments: allSegments.filter((d) => uniqueSegments.includes(d)),
    };
  }, [
    segmentDimension,
    getSegment,
    fields.segment?.sorting,
    fields.segment?.useAbbreviations,
    segmentData,
    scalesData,
    segmentFilter,
  ]);

  // Map ordered segments to colors
  const colors = scaleOrdinal<string, string>();

  if (fields.segment && segmentDimension && fields.segment.colorMapping) {
    const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
      const dvIri =
        segmentsByAbbreviationOrLabel.get(segment)?.value ||
        segmentsByValue.get(segment)?.value ||
        "";

      return {
        label: segment,
        color: fields.segment?.colorMapping![dvIri] || "#006699",
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(allSegments);
    colors.range(getPalette(fields.segment?.palette));
  }

  // Dimensions
  const left = interactiveFiltersConfig?.timeRange.active
    ? estimateTextWidth(formatNumber(entireMaxValue))
    : Math.max(
        estimateTextWidth(formatNumber(yScale.domain()[0])),
        estimateTextWidth(formatNumber(yScale.domain()[1]))
      );
  const bottom = interactiveFiltersConfig?.timeRange.active
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
    const yAnchor = yScale(getY(datum) ?? 0);

    const tooltipValues = chartData.filter(
      (j) => getX(j).getTime() === getX(datum).getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortingOrder: "asc",
    });

    const xPlacement = "center";

    const yPlacement = "top";

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

    return {
      xAnchor,
      yAnchor,
      placement: { x: xPlacement, y: yPlacement },
      xValue: timeFormatUnit(getX(datum), xDimension.timeUnit),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        hide: getY(td) === null,
        label: getSegmentAbbreviationOrLabel(td),
        value: yValueFormatter(getY(td)),
        color: colors(getSegment(td)) as string,
        yPos: yScale(getY(td) ?? 0),
      })),
    };
  };

  return {
    chartType: "line",
    bounds,
    chartData,
    allData,
    xScale,
    xEntireScale,
    yScale,
    segments,
    colors,
    grouped: preparedDataGroupedBySegment,
    chartWideData,
    allDataWide,
    xKey,
    getAnnotationInfo,
    ...variables,
  };
};

const LineChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<LineConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useLinesStateVariables(chartProps);
  const data = useLinesStateData(chartProps, variables);
  const state = useLinesState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const LineChart = (
  props: React.PropsWithChildren<
    ChartProps<LineConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <LineChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
