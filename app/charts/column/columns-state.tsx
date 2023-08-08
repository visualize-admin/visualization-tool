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
import {
  BOTTOM_MARGIN_OFFSET,
  LEFT_MARGIN_OFFSET,
  PADDING_INNER,
  PADDING_OUTER,
} from "@/charts/column/constants";
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
    yErrorMeasure,
    getYError,
    getYErrorRange,
  } = variables;
  const { chartData, scalesData, timeRangeData, allData } = data;
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
    interactiveXTimeRangeScale,
    xScaleInteraction,
    bandDomainLabels,
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
    const bandDomainLabels = bandDomain.map(getXLabel);
    const xScale = scaleBand()
      .domain(bandDomain)
      .paddingInner(PADDING_INNER)
      .paddingOuter(PADDING_OUTER);
    const xScaleInteraction = scaleBand()
      .domain(bandDomain)
      .paddingInner(0)
      .paddingOuter(0);

    const interactiveXTimeRangeDomain = extent(timeRangeData, (d) =>
      getXAsDate(d)
    ) as [Date, Date];

    const interactiveXTimeRangeScale = scaleTime().domain(
      interactiveXTimeRangeDomain
    );

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

    return {
      xScale,
      yScale,
      interactiveXTimeRangeScale,
      xScaleInteraction,
      bandDomainLabels,
    };
  }, [
    getX,
    getXLabel,
    getXAsDate,
    getY,
    getYErrorRange,
    scalesData,
    timeRangeData,
    fields.x.sorting,
    fields.x.useAbbreviations,
    xDimension,
    chartConfig.filters,
    sumsByX,
  ]);

  const { left, bottom } = useChartPadding(
    yScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    bandDomainLabels
  );
  const margins = {
    top: 50,
    right: 40,
    bottom: bottom + BOTTOM_MARGIN_OFFSET,
    left: left + LEFT_MARGIN_OFFSET,
  };
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;

  xScale.range([0, chartWidth]);
  xScaleInteraction.range([0, chartWidth]);
  interactiveXTimeRangeScale.range([0, chartWidth]);
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

    return {
      xAnchor,
      yAnchor,
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor,
        segment: !!fields.segment,
      }),
      xValue: xTimeUnit ? timeFormatUnit(xLabel, xTimeUnit) : xLabel,
      datum: {
        label: undefined,
        value: `${yValueFormatter(getY(d))}`,
        error: getYError
          ? `${getYError(d)}${yErrorMeasure?.unit ?? ""}`
          : undefined,
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
    interactiveXTimeRangeScale,
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
