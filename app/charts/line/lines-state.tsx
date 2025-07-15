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
import { PropsWithChildren, useCallback, useMemo } from "react";

import {
  LinesStateVariables,
  useLinesStateData,
  useLinesStateVariables,
} from "@/charts/line/lines-state-props";
import { AnnotationInfo } from "@/charts/shared/annotations";
import {
  AxisLabelSizeVariables,
  getChartWidth,
  useAxisLabelSizeVariables,
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
import { DEFAULT_ANNOTATION_CIRCLE_COLOR } from "@/charts/shared/interaction/annotation-circle";
import { TooltipInfo, TooltipValue } from "@/charts/shared/interaction/tooltip";
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import { DEFAULT_MARGIN_TOP } from "@/charts/shared/margins";
import {
  ShowTemporalValueLabelsVariables,
  useShowTemporalValueLabelsVariables,
} from "@/charts/shared/show-values-utils";
import { useChartFormatters } from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { useLimits } from "@/config-utils";
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

import { ChartProps } from "../shared/chart-props";

export type LinesState = CommonChartState &
  LinesStateVariables &
  InteractiveXTimeRangeState &
  Omit<ShowTemporalValueLabelsVariables, "yOffset"> & {
    chartType: "line";
    segments: string[];
    xScale: ScaleTime<number, number>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    grouped: Map<string, Observation[]>;
    chartWideData: ArrayLike<Observation>;
    xKey: string;
    getAnnotationInfo: (d: Observation, segment: string) => AnnotationInfo;
    getTooltipInfo: (d: Observation) => TooltipInfo;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffsetTop: number;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useLinesState = (
  chartProps: ChartProps<LineConfig>,
  variables: LinesStateVariables,
  data: ChartStateData
): LinesState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const {
    xDimension,
    getX,
    getXAsString,
    yMeasure,
    getY,
    getYErrorRange,
    getFormattedYUncertainty,
    getMinY,
    xAxisLabel,
    segmentDimension,
    segmentsByAbbreviationOrLabel,
    getSegment,
    getSegmentAbbreviationOrLabel,
    getSegmentLabel,
    yAxisLabel,
    minLimitValue,
    maxLimitValue,
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
  const { y } = fields;

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
  const yScale = scaleLinear();
  const paddingYScale = scaleLinear();

  if (y.customDomain) {
    yScale.domain(y.customDomain);
    paddingYScale.domain(y.customDomain);
  } else {
    const minValue = getMinY(scalesData, (d) => {
      return getYErrorRange?.(d)[0] ?? getY(d);
    });
    const maxValue =
      max(scalesData, (d) => {
        return getYErrorRange?.(d)[1] ?? getY(d);
      }) ?? 0;
    yScale
      .domain([
        minLimitValue !== undefined
          ? Math.min(minLimitValue, minValue)
          : minValue,
        maxLimitValue !== undefined
          ? Math.max(maxLimitValue, maxValue)
          : maxValue,
      ])
      .nice();

    const paddingMinValue = getMinY(paddingData, (d) => {
      return getYErrorRange?.(d)[0] ?? getY(d);
    });
    const paddingMaxValue =
      max(paddingData, (d) => {
        return getYErrorRange?.(d)[1] ?? getY(d);
      }) ?? 0;
    paddingYScale
      .domain([
        minLimitValue !== undefined
          ? Math.min(minLimitValue, paddingMinValue)
          : paddingMinValue,
        maxLimitValue !== undefined
          ? Math.max(maxLimitValue, paddingMaxValue)
          : paddingMaxValue,
      ])
      .nice();
  }

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

  if (fields.segment && segmentDimension && fields.color) {
    const orderedSegmentLabelsAndColors = allSegments.map((segment) => {
      const dvIri =
        segmentsByAbbreviationOrLabel.get(segment)?.value ||
        segmentsByValue.get(segment)?.value ||
        "";

      return {
        label: segment,
        color:
          fields.color.type === "segment"
            ? (fields.color.colorMapping![dvIri] ?? schemeCategory10[0])
            : schemeCategory10[0],
      };
    });

    colors.domain(orderedSegmentLabelsAndColors.map((s) => s.label));
    colors.range(orderedSegmentLabelsAndColors.map((s) => s.color));
  } else {
    colors.domain(allSegments);
    colors.range(
      getPalette({
        paletteId: fields.color?.paletteId,
        colorField: fields.color,
      })
    );
  }

  // Dimensions
  const { top, left, bottom } = useChartPadding({
    xLabelPresent: !!xAxisLabel,
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
  });
  const right = 40;

  const chartWidth = getChartWidth({ width, left, right });
  xScale.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);

  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yAxisLabel,
    width,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xAxisLabel,
    width,
  });
  const { yOffset: yValueLabelsOffset, ...showValuesVariables } =
    useShowTemporalValueLabelsVariables(y, {
      dimensions,
      measures,
      segment: fields.segment,
    });
  const margins = {
    top:
      DEFAULT_MARGIN_TOP + top + leftAxisLabelSize.offset + yValueLabelsOffset,
    right,
    bottom,
    left,
  };
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  const getAnnotationInfo = useCallback(
    (datum: Observation) => {
      const x = xScale(getX(datum));
      const y = yScale(getY(datum) ?? 0);

      return {
        x,
        y,
        color: DEFAULT_ANNOTATION_CIRCLE_COLOR,
      };
    },
    [getX, getY, xScale, yScale]
  );

  const getTooltipInfo = (datum: Observation): TooltipInfo => {
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
        color: colors(getSegment(datum)),
      },
      values: sortedTooltipValues.map((d) => {
        const segment = getSegment(d);

        return {
          hide: getY(d) === null,
          label: getSegmentAbbreviationOrLabel(d),
          value: yValueFormatter(getY(d)),
          axis: "y",
          axisOffset: yScale(getY(d) ?? 0),
          symbol: "line",
          color: colors(segment),
        } satisfies TooltipValue;
      }),
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
    getTooltipInfo,
    leftAxisLabelSize,
    leftAxisLabelOffsetTop: top,
    bottomAxisLabelSize,
    ...showValuesVariables,
    ...variables,
  };
};

const LineChartProvider = (
  props: PropsWithChildren<
    ChartProps<LineConfig> & { limits: ReturnType<typeof useLimits> }
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
  props: PropsWithChildren<
    ChartProps<LineConfig> & { limits: ReturnType<typeof useLimits> }
  >
) => {
  return (
    <InteractionProvider>
      <LineChartProvider {...props} />
    </InteractionProvider>
  );
};
