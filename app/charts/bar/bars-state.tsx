import { extent, max, rollup, sum } from "d3-array";
import {
  ScaleBand,
  scaleBand,
  ScaleLinear,
  scaleLinear,
  scaleTime,
} from "d3-scale";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  BarsStateVariables,
  useBarsStateData,
  useBarsStateVariables,
} from "@/charts/bar/bars-state-props";
import { PADDING_INNER, PADDING_OUTER } from "@/charts/bar/constants";
import {
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveYTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfoInverted } from "@/charts/shared/interaction/tooltip";
import {
  getCenteredTooltipPlacement,
  MOBILE_TOOLTIP_PLACEMENT,
} from "@/charts/shared/interaction/tooltip-box";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { useSize } from "@/charts/shared/use-size";
import { BarConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import {
  formatNumberWithUnit,
  useFormatNumber,
  useTimeFormatUnit,
} from "@/formatters";
import {
  getSortingOrders,
  makeDimensionValueSorters,
} from "@/utils/sorting-values";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

export type BarsState = CommonChartState &
  BarsStateVariables &
  InteractiveYTimeRangeState & {
    chartType: "bar";
    xScale: ScaleLinear<number, number>;
    yScaleInteraction: ScaleBand<string>;
    yScale: ScaleBand<string>;
    minY: string;
    getAnnotationInfo: (d: Observation) => TooltipInfoInverted;
  };

const useBarsState = (
  chartProps: ChartProps<BarConfig>,
  variables: BarsStateVariables,
  data: ChartStateData
): BarsState => {
  const { chartConfig } = chartProps;
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
  } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

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
    yScale,
    minY,
    paddingYScale,
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
      //NOTE: not sure if this is the right way to go here
      .domain(bandDomain.reverse())
      .paddingInner(0)
      .paddingOuter(0);

    const yScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getYAsDate(d)
    ) as [Date, Date];

    const yScaleTimeRange = scaleTime().domain(yScaleTimeRangeDomain);

    const minValue = getMinX(scalesData, (d) =>
      getXErrorRange ? getXErrorRange(d)[0] : getX(d)
    );
    const maxValue = Math.max(
      max(scalesData, (d) =>
        getXErrorRange ? getXErrorRange(d)[1] : getX(d)
      ) ?? 0,
      0
    );
    const xScale = scaleLinear().domain([minValue, maxValue]).nice();

    const paddingMinValue = getMinX(paddingData, (d) =>
      getXErrorRange ? getXErrorRange(d)[0] : getX(d)
    );
    const paddingMaxValue = Math.max(
      max(paddingData, (d) =>
        getXErrorRange ? getXErrorRange(d)[1] : getX(d)
      ) ?? 0,
      0
    );
    const paddingYScale = scaleLinear()
      .domain([paddingMinValue, paddingMaxValue])
      .nice();

    return {
      xScale,
      yScale,
      minY: bandDomain[0],
      paddingYScale,
      yScaleTimeRange,
      yScaleInteraction,
      yTimeRangeDomainLabels,
    };
  }, [
    getX,
    getYLabel,
    getYAsDate,
    getY,
    getXErrorRange,
    scalesData,
    paddingData,
    timeRangeData,
    fields.y.sorting,
    fields.y.useAbbreviations,
    yDimension,
    chartConfig.cubes,
    sumsByY,
    getMinX,
  ]);

  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent: !!fields.animation,
    formatNumber,
    bandDomain: yTimeRangeDomainLabels.every((d) => d === undefined)
      ? yScale.domain()
      : yTimeRangeDomainLabels,
  });
  const right = 40;
  const margins = {
    top: 0,
    right,
    bottom,
    //NOTE: hardcoded for the moment
    left: 50 + left,
  };

  const bounds = useChartBounds(width, margins, height);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  yScaleInteraction.range([0, chartHeight]);
  yScaleTimeRange.range([0, chartHeight]);
  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfoInverted => {
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
      yValue: yTimeUnit ? timeFormatUnit(yLabel, yTimeUnit) : yLabel,
      datum: {
        label: undefined,
        value: x !== null && isNaN(x) ? "-" : `${xValueFormatter(getX(d))}`,
        error: getFormattedXUncertainty(d),
        color: "",
      },
      values: undefined,
    };
  };

  return {
    chartType: "bar",
    bounds,
    chartData,
    allData,
    xScale,
    minY,
    yScaleTimeRange,
    yScaleInteraction,
    yScale,
    getAnnotationInfo,
    ...variables,
  };
};

const BarChartProvider = (
  props: React.PropsWithChildren<ChartProps<BarConfig>>
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
  props: React.PropsWithChildren<ChartProps<BarConfig>>
) => {
  return (
    <InteractionProvider>
      <BarChartProvider {...props} />
    </InteractionProvider>
  );
};
