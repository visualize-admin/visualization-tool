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
  ColumnsStateVariables,
  useColumnsStateData,
  useColumnsStateVariables,
} from "@/charts/column/columns-state-props";
import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
import {
  useAxisLabelHeightOffset,
  useChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
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
import { ColumnConfig } from "@/configurator";
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

export type ColumnsState = CommonChartState &
  ColumnsStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "column";
    xScale: ScaleBand<string>;
    xScaleInteraction: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
  };

const useColumnsState = (
  chartProps: ChartProps<ColumnConfig>,
  variables: ColumnsStateVariables,
  data: ChartStateData
): ColumnsState => {
  const { chartConfig } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    xTimeUnit,
    yMeasure,
    getY,
    getMinY,
    getYErrorRange,
    getFormattedYUncertainty,
  } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const { width, height } = useSize();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const timeFormatUnit = useTimeFormatUnit();

  const sumsByX = useMemo(() => {
    return Object.fromEntries(
      rollup(
        chartData,
        (v) => sum(v, (x) => getY(x)),
        (x) => getX(x)
      )
    );
  }, [chartData, getX, getY]);

  const {
    xScale,
    yScale,
    paddingYScale,
    xScaleTimeRange,
    xScaleInteraction,
    xTimeRangeDomainLabels,
  } = useMemo(() => {
    const sorters = makeDimensionValueSorters(xDimension, {
      sorting: fields.x.sorting,
      measureBySegment: sumsByX,
      useAbbreviations: fields.x.useAbbreviations,
      dimensionFilter: xDimension?.id
        ? chartConfig.cubes.find((d) => d.iri === xDimension.cubeIri)?.filters[
            xDimension.id
          ]
        : undefined,
    });
    const sortingOrders = getSortingOrders(sorters, fields.x.sorting);
    const bandDomain = orderBy(
      [...new Set(scalesData.map(getX))],
      sorters,
      sortingOrders
    );
    const xTimeRangeValues = [...new Set(timeRangeData.map(getX))];
    const xTimeRangeDomainLabels = xTimeRangeValues.map(getXLabel);
    const xScale = scaleBand()
      .domain(bandDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(bandDomain)
      .paddingInner(0)
      .paddingOuter(0);

    const xScaleTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];

    const xScaleTimeRange = scaleTime().domain(xScaleTimeRangeDomain);

    const minValue = getMinY(scalesData, (d) =>
      getYErrorRange ? getYErrorRange(d)[0] : getY(d)
    );
    const maxValue = Math.max(
      max(scalesData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );
    const yScale = scaleLinear().domain([minValue, maxValue]).nice();

    const paddingMinValue = getMinY(paddingData, (d) =>
      getYErrorRange ? getYErrorRange(d)[0] : getY(d)
    );
    const paddingMaxValue = Math.max(
      max(paddingData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );
    const paddingYScale = scaleLinear()
      .domain([paddingMinValue, paddingMaxValue])
      .nice();

    return {
      xScale,
      yScale,
      paddingYScale,
      xScaleTimeRange,
      xScaleInteraction,
      xTimeRangeDomainLabels,
    };
  }, [
    getX,
    getXLabel,
    getXAsDate,
    getY,
    getYErrorRange,
    scalesData,
    paddingData,
    timeRangeData,
    fields.x.sorting,
    fields.x.useAbbreviations,
    xDimension,
    chartConfig.cubes,
    sumsByX,
    getMinY,
  ]);

  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent: !!fields.animation,
    formatNumber,
    bandDomain: xTimeRangeDomainLabels.every((d) => d === undefined)
      ? xScale.domain()
      : xTimeRangeDomainLabels,
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
  xScaleInteraction.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  const isMobile = useIsMobile();

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const xAnchor = (xScale(getX(d)) as number) + xScale.bandwidth() * 0.5;
    const yAnchor = isMobile
      ? chartHeight
      : yScale(Math.max(getY(d) ?? NaN, 0));
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor,
          topAnchor: !fields.segment,
        });

    const xLabel = getXAbbreviationOrLabel(d);

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.id] ?? formatNumber,
        yMeasure.unit
      );
    const y = getY(d);

    return {
      xAnchor,
      yAnchor,
      placement,
      value: xTimeUnit ? timeFormatUnit(xLabel, xTimeUnit) : xLabel,
      datum: {
        label: undefined,
        value: y !== null && isNaN(y) ? "-" : `${yValueFormatter(getY(d))}`,
        error: getFormattedYUncertainty(d),
        color: "",
      },
      values: undefined,
    };
  };

  return {
    chartType: "column",
    bounds,
    chartData,
    allData,
    xScale,
    xScaleTimeRange,
    xScaleInteraction,
    yScale,
    getAnnotationInfo,
    ...variables,
  };
};

const ColumnChartProvider = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useColumnsStateVariables(chartProps);
  const data = useColumnsStateData(chartProps, variables);
  const state = useColumnsState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ColumnChart = (
  props: React.PropsWithChildren<ChartProps<ColumnConfig>>
) => {
  return (
    <InteractionProvider>
      <ColumnChartProvider {...props} />
    </InteractionProvider>
  );
};
