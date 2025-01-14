import { extent, group, max } from "d3-array";
import {
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  ScaleTime,
  scaleTime,
} from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  LinesStateVariables,
  useLinesStateData,
  useLinesStateVariables,
} from "@/charts/line/lines-state-props";
import {
  useAxisLabelHeightOffset,
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import { getWideData } from "@/charts/shared/chart-helpers";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { LineConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import { getPalette } from "@/palettes";
import { sortByIndex } from "@/utils/array";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type LinesState = CommonChartState &
  LinesStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "line";
    segments: string[];
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    grouped: Map<string, Observation[]>;
    chartWideData: ArrayLike<Observation>;
    xKey: string;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useLinesState = (
  chartProps: ChartProps<LineConfig>,
  variables: LinesStateVariables,
  data: ChartStateData
): LinesState => {
  const { chartConfig } = chartProps;
  const {
    xDimension,
    getX,
    getXAsString,
    yMeasure,
    getY,
    getYErrorRange,
    getFormattedYUncertainty,
    getMinY,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
  } = variables;
  const {
    chartData,
    scalesData,
    segmentData,
    timeRangeData,
    paddingData,
    allData,
  } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const timeFormatUnit = useTimeFormatUnit();
  const formatters = useChartFormatters(chartProps);
  const xKey = xDimension.id;

  const segmentsByValue = useMemo(() => {
    const values = segmentDimension?.values || [];

    return new Map(values.map((d) => [d.value, d]));
  }, [segmentDimension?.values]);

  const preparedDataGroupedBySegment = useMemo(
    () => group(chartData, getSegment),
    [chartData, getSegment]
  );

  const preparedDataGroupedByX = useMemo(
    () => group(chartData, getXAsString),
    [chartData, getXAsString]
  );

  const chartWideData = getWideData({
    dataGrouped: preparedDataGroupedByX,
    key: xKey,
    getAxisValue: getY,
    getSegment,
  });

  // x
  const xDomain = extent(chartData, (d) => getX(d)) as [Date, Date];
  const xScale = scaleTime().domain(xDomain);

  const xScaleTimeRangeDomain = useMemo(() => {
    return extent(timeRangeData, (d) => getX(d)) as [Date, Date];
  }, [timeRangeData, getX]);
  const xScaleTimeRange = scaleTime().domain(xScaleTimeRangeDomain);

  // y
  const minValue = getMinY(scalesData, (d) =>
    getYErrorRange ? getYErrorRange(d)[0] : getY(d)
  );
  const maxValue =
    max(scalesData, (d) => (getYErrorRange ? getYErrorRange(d)[1] : getY(d))) ??
    0;
  const yDomain = [minValue, maxValue];
  const yScale = scaleLinear().domain(yDomain).nice();

  const paddingMinValue = getMinY(paddingData, (d) =>
    getYErrorRange ? getYErrorRange(d)[0] : getY(d)
  );
  const paddingMaxValue =
    max(paddingData, (d) =>
      getYErrorRange ? getYErrorRange(d)[1] : getY(d)
    ) ?? 0;
  const paddingYScale = scaleLinear()
    .domain([paddingMinValue, paddingMaxValue])
    .nice();

  // segments
  const segmentFilter = segmentDimension?.id
    ? chartConfig.cubes.find((d) => d.iri === segmentDimension.cubeIri)
        ?.filters[segmentDimension.id]
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
        color: fields.segment?.colorMapping![dvIri] ?? schemeCategory10[0],
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(allSegments);
    colors.range(getPalette(fields.segment?.palette));
  }

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
  });
  const right = 40;
  const { offset: yAxisLabelMargin } = useAxisLabelHeightOffset({
    label: yMeasure.label,
    width,
    marginLeft: left,
    marginRight: right,
  });
  const margins = {
    top: 50 + yAxisLabelMargin,
    right,
    bottom,
    left,
  };
  const bounds = useChartBounds(width, margins, height);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (datum: Observation): TooltipInfo => {
    const x = getX(datum);
    const tooltipValues = chartData.filter(
      (d) => getX(d).getTime() === x.getTime()
    );
    const sortedTooltipValues = sortByIndex({
      data: tooltipValues,
      order: segments,
      getCategory: getSegment,
      sortingOrder: "asc",
    });

    const xAnchor = xScale(x);
    const yValues = tooltipValues.map(getY);
    const [yMin, yMax] = extent(yValues, (d) => d ?? 0) as [number, number];
    const yAnchor = isMobile ? chartHeight : yScale((yMin + yMax) * 0.5);
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor,
          topAnchor: !fields.segment,
        });

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.id] ?? formatNumber,
        yMeasure.unit
      );

    return {
      xAnchor,
      yAnchor,
      placement,
      value: timeFormatUnit(getX(datum), xDimension.timeUnit),
      datum: {
        label: fields.segment && getSegmentAbbreviationOrLabel(datum),
        value: yValueFormatter(getY(datum)),
        error: getFormattedYUncertainty(datum),
        color: colors(getSegment(datum)) as string,
      },
      values: sortedTooltipValues.map((td) => ({
        hide: getY(td) === null,
        label: getSegmentAbbreviationOrLabel(td),
        value: yValueFormatter(getY(td)),
        color: colors(getSegment(td)) as string,
        yPos: yScale(getY(td) ?? 0),
        symbol: "line",
      })),
    };
  };

  return {
    chartType: "line",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleTimeRange,
    yScale,
    segments,
    colors,
    getColorLabel: getSegmentLabel,
    grouped: preparedDataGroupedBySegment,
    chartWideData,
    xKey,
    getAnnotationInfo,
    ...variables,
  };
};

const LineChartProvider = (
  props: React.PropsWithChildren<ChartProps<LineConfig>>
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
  props: React.PropsWithChildren<ChartProps<LineConfig>>
) => {
  return (
    <InteractionProvider>
      <LineChartProvider {...props} />
    </InteractionProvider>
  );
};
