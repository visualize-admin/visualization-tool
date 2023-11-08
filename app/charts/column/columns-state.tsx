import {
  extent,
  max,
  min,
  rollup,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  scaleTime,
  sum,
} from "d3";
import orderBy from "lodash/orderBy";
import { useMemo } from "react";

import {
  ColumnsStateVariables,
  useColumnsStateData,
  useColumnsStateVariables,
} from "@/charts/column/columns-state-props";
import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
import {
  getChartBounds,
  useChartPadding,
} from "@/charts/shared/chart-dimensions";
import {
  ChartContext,
  ChartStateData,
  CommonChartState,
  InteractiveXTimeRangeState,
} from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { getCenteredTooltipPlacement } from "@/charts/shared/interaction/tooltip-box";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer, useWidth } from "@/charts/shared/use-width";
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
  chartProps: ChartProps<ColumnConfig> & { aspectRatio: number },
  variables: ColumnsStateVariables,
  data: ChartStateData
): ColumnsState => {
  const { aspectRatio, chartConfig } = chartProps;
  const {
    xDimension,
    getX,
    getXAsDate,
    getXAbbreviationOrLabel,
    getXLabel,
    xTimeUnit,
    yMeasure,
    getY,
    showYStandardError,
    yErrorMeasure,
    getYError,
    getYErrorRange,
  } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
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
      dimensionFilter: xDimension?.iri
        ? chartConfig.filters[xDimension.iri]
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

    const minValue = Math.min(
      min(scalesData, (d) =>
        getYErrorRange ? getYErrorRange(d)[0] : getY(d)
      ) ?? 0,
      0
    );
    const maxValue = Math.max(
      max(scalesData, (d) =>
        getYErrorRange ? getYErrorRange(d)[1] : getY(d)
      ) ?? 0,
      0
    );
    const yScale = scaleLinear().domain([minValue, maxValue]).nice();

    const paddingMinValue = Math.min(
      min(paddingData, (d) =>
        getYErrorRange ? getYErrorRange(d)[0] : getY(d)
      ) ?? 0,
      0
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
    chartConfig.filters,
    sumsByX,
  ]);

  const { left, bottom } = useChartPadding({
    yScale: paddingYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    animationPresent: !!fields.animation,
    formatNumber,
    bandDomain: xTimeRangeDomainLabels,
  });
  const margins = {
    top: 50,
    right: 40,
    bottom,
    left,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  xScaleTimeRange.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const xAnchor = (xScale(getX(d)) as number) + xScale.bandwidth() * 0.5;
    const yAnchor = yScale(Math.max(getY(d) ?? NaN, 0));
    const xLabel = getXAbbreviationOrLabel(d);

    const yValueFormatter = (value: number | null) =>
      formatNumberWithUnit(
        value,
        formatters[yMeasure.iri] || formatNumber,
        yMeasure.unit
      );

    const getError = (d: Observation) => {
      if (!showYStandardError || !getYError || getYError(d) === null) {
        return;
      }

      return `${getYError(d)}${yErrorMeasure?.unit ?? ""}`;
    };

    return {
      xAnchor,
      yAnchor,
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor,
        topAnchor: !fields.segment,
      }),
      xValue: xTimeUnit ? timeFormatUnit(xLabel, xTimeUnit) : xLabel,
      datum: {
        label: undefined,
        value: `${yValueFormatter(getY(d))}`,
        error: getError(d),
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
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
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
  props: React.PropsWithChildren<
    ChartProps<ColumnConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ColumnChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
