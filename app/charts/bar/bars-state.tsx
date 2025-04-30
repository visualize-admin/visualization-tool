import { extent, max, rollup, sum } from "d3-array";
import {
  ScaleBand,
  scaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
} from "d3-scale";
import orderBy from "lodash/orderBy";
import { PropsWithChildren, useMemo } from "react";

import {
  BarsStateVariables,
  useBarsStateData,
  useBarsStateVariables,
} from "@/charts/bar/bars-state-props";
import {
  MIN_BAR_HEIGHT,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/bar/constants";
import {
  AxisLabelSizeVariables,
  getChartWidth,
  useAxisLabelSizeVariables,
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveYTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import { DEFAULT_MARGIN_TOP } from "@/charts/shared/margins";
import {
  ShowBandValueLabelsVariables,
  useShowBandValueLabelsVariables,
} from "@/charts/shared/show-values-utils";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { useLimits } from "@/config-utils";
import { BarConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import { getPalette } from "@/palettes";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type BarsState = CommonChartState &
  BarsStateVariables &
  InteractiveYTimeRangeState &
  Omit<ShowBandValueLabelsVariables, "offset"> & {
    chartType: "bar";
    xScale: ScaleLinear<number, number>;
    yScaleInteraction: ScaleBand<string>;
    yScale: ScaleBand<string>;
    minY: string;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    colors: ScaleOrdinal<string, string>;
    getColorLabel: (segment: string) => string;
    leftAxisLabelSize: AxisLabelSizeVariables;
    leftAxisLabelOffsetTop: number;
    bottomAxisLabelSize: AxisLabelSizeVariables;
  };

const useBarsState = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsStateVariables,
  data: ChartStateData
): BarsState => {
  const { chartConfig, dimensions, measures } = chartProps;
  const {
    yDimension,
    getX,
    getYAsDate,
    getYAbbreviationOrLabel,
    getYLabel,
    yTimeUnit,
    xMeasure,
    getY,
    getMinX,
    getXErrorRange,
    getFormattedXUncertainty,
    getSegmentLabel,
    xAxisLabel,
    yAxisLabel,
    minLimitValue,
    maxLimitValue,
  } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const { x } = fields;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const timeFormatUnit = useTimeFormatUnit();

  const sumsByY = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (x) => getX(x)),
        (x) => getY(x)
      )
    );
  }, [chartData, getX, getY]);

  const {
    xScale,
    paddingXScale,
    yScale,
    minY,
    yScaleTimeRange,
    yScaleInteraction,
    yTimeRangeDomainLabels,
  } = useMemo(() => {
    const sorters = makeDimensionValueSorters(yDimension, {
      sorting: fields.y.sorting,
      measureBySegment: sumsByY,
      useAbbreviations: fields.y.useAbbreviations,
      dimensionFilter: yDimension?.id
        ? chartConfig.cubes.find((d) => d.iri === yDimension.cubeIri)?.filters[
            yDimension.id
          ]
        : undefined,
    });
    const sortingOrders = getSortingOrders(sorters, fields.y.sorting);
    const bandDomain = orderBy(
      [...new Set(scalesData.map(getY))],
      sorters,
      sortingOrders
    );
    const yTimeRangeValues = [...new Set(timeRangeData.map(getY))];
    const yTimeRangeDomainLabels = yTimeRangeValues.map(getYLabel);
    const yScale = scaleBand()
      .domain(bandDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const yScaleInteraction = scaleBand()
      .domain(bandDomain)
      .paddingInner(0)
      .paddingOuter(0);

    const yScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getYAsDate(d)
    ) as [Date, Date];

    const yScaleTimeRange = scaleTime().domain(yScaleTimeRangeDomain);

    const xScale = scaleLinear();
    const paddingXScale = scaleLinear();

    if (x.customDomain) {
      xScale.domain(x.customDomain);
      paddingXScale.domain(x.customDomain);
    } else {
      const minValue = getMinX(scalesData, (d) => {
        return getXErrorRange?.(d)[0] ?? getX(d);
      });
      const maxValue = Math.max(
        max(scalesData, (d) => {
          return getXErrorRange?.(d)[1] ?? getX(d);
        }) ?? 0,
        0
      );
      xScale
        .domain([
          minLimitValue !== undefined
            ? Math.min(minLimitValue, minValue)
            : minValue,
          maxLimitValue !== undefined
            ? Math.max(maxLimitValue, maxValue)
            : maxValue,
        ])
        .nice();

      const paddingMinValue = getMinX(paddingData, (d) => {
        return getXErrorRange?.(d)[0] ?? getX(d);
      });
      const paddingMaxValue = Math.max(
        max(paddingData, (d) => {
          return getXErrorRange?.(d)[1] ?? getX(d);
        }) ?? 0,
        0
      );
      paddingXScale
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

    return {
      xScale,
      yScale,
      minY: bandDomain[0],
      paddingXScale,
      yScaleTimeRange,
      yScaleInteraction,
      yTimeRangeDomainLabels,
    };
  }, [
    yDimension,
    fields.y.sorting,
    fields.y.useAbbreviations,
    sumsByY,
    chartConfig.cubes,
    scalesData,
    getY,
    timeRangeData,
    getYLabel,
    getMinX,
    minLimitValue,
    maxLimitValue,
    paddingData,
    getYAsDate,
    getXErrorRange,
    getX,
    x.customDomain,
  ]);

  const { top, left, bottom } = useChartPadding({
    xLabelPresent: !!xMeasure.label,
    yScale: paddingXScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: yTimeRangeDomainLabels.every((d) => d === undefined)
      ? yScale.domain()
      : yTimeRangeDomainLabels,
    isFlipped: true,
  });
  const right = 40;
  const leftAxisLabelSize = useAxisLabelSizeVariables({
    label: yAxisLabel,
    width,
  });
  const bottomAxisLabelSize = useAxisLabelSizeVariables({
    label: xAxisLabel,
    width,
  });
  const margins = {
    top: DEFAULT_MARGIN_TOP + top + leftAxisLabelSize.offset,
    right,
    bottom: bottom + 45,
    left,
  };

  const barCount = yScale.domain().length;
  const { offset: xValueLabelsOffset, ...showValuesVariables } =
    useShowBandValueLabelsVariables(x, {
      chartData,
      dimensions,
      measures,
      getValue: getX,
    });

  const chartWidth = getChartWidth({ width, left, right });
  const bounds = useChartBounds({ width, chartWidth, height, margins });
  const { chartHeight } = bounds;

  // Here we adjust the height to make sure the bars have a minimum height and are legible
  const adjustedChartHeight =
    barCount * MIN_BAR_HEIGHT > chartHeight
      ? barCount * MIN_BAR_HEIGHT
      : chartHeight;

  xScale.range([0, chartWidth - xValueLabelsOffset]);
  yScaleInteraction.range([0, adjustedChartHeight]);
  yScaleTimeRange.range([0, adjustedChartHeight]);
  yScale.range([0, adjustedChartHeight]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const yAnchor = (yScale(getY(d)) as number) + yScale.bandwidth() * 0.5;
    const xAnchor = isMobile
      ? chartHeight
      : xScale(Math.max(getX(d) ?? NaN, 0));
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor: yAnchor,
          topAnchor: !fields.segment,
        });

    const yLabel = getYAbbreviationOrLabel(d);

    const xValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[xMeasure.id] ?? formatNumber,
        xMeasure.unit
      );

    const x = getX(d);

    return {
      xAnchor,
      yAnchor,
      placement,
      value: yTimeUnit ? timeFormatUnit(yLabel, yTimeUnit) : yLabel,
      datum: {
        label: undefined,
        value: x !== null && isNaN(x) ? "-" : `${xValueFormatter(getX(d))}`,
        error: getFormattedXUncertainty(d),
        color: "",
      },
      values: undefined,
    };
  };

  const { colors } = useMemo(() => {
    const colors = scaleOrdinal<string, string>();

    colors.range(
      getPalette({
        paletteId: fields.color.paletteId,
        colorField: fields.color,
      })
    );

    return { colors };
  }, [fields.color]);

  return {
    chartType: "bar",
    bounds: {
      ...bounds,
      chartHeight: adjustedChartHeight,
    },
    chartData,
    allData,
    xScale,
    minY,
    yScaleTimeRange,
    yScaleInteraction,
    yScale,
    getAnnotationInfo,
    getColorLabel: getSegmentLabel,
    colors,
    leftAxisLabelSize,
    leftAxisLabelOffsetTop: top,
    bottomAxisLabelSize,
    ...showValuesVariables,
    ...variables,
  };
};

const BarChartProvider = (
  props: PropsWithChildren<
    ChartProps<BarConfig> & { limits: ReturnType<typeof useLimits> }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useBarsStateVariables(chartProps);
  const data = useBarsStateData(chartProps, variables);
  const state = useBarsState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const BarChart = (
  props: PropsWithChildren<
    ChartProps<BarConfig> & { limits: ReturnType<typeof useLimits> }
  >
) => {
  return (
    <InteractionProvider>
      <BarChartProvider {...props} />
    </InteractionProvider>
  );
};
