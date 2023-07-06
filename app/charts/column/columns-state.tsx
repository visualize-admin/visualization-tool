import {
  extent,
  max,
  min,
  scaleBand,
  ScaleBand,
  ScaleLinear,
  scaleLinear,
  ScaleOrdinal,
  scaleOrdinal,
  scaleTime,
  ScaleTime,
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
import { ChartStateData, CommonChartState } from "@/charts/shared/chart-state";
import { TooltipInfo } from "@/charts/shared/interaction/tooltip";
import { useChartPadding } from "@/charts/shared/padding";
import useChartFormatters from "@/charts/shared/use-chart-formatters";
import { ChartContext } from "@/charts/shared/use-chart-state";
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
  ColumnsStateVariables & {
    chartType: "column";
    xScale: ScaleBand<string>;
    xEntireScale: ScaleTime<number, number>;
    xScaleInteraction: ScaleBand<string>;
    yScale: ScaleLinear<number, number>;
    colors: ScaleOrdinal<string, string>;
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
  const { chartData, scalesData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;

  const width = useWidth();
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const formatters = useChartFormatters(chartProps);
  const timeFormatUnit = useTimeFormatUnit();

  // Scales
  const { xScale, yScale, xEntireScale, xScaleInteraction, bandDomainLabels } =
    useMemo(() => {
      // x
      const sorters = makeDimensionValueSorters(xDimension, {
        sorting: fields.x.sorting,
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

      // x as time, needs to be memoized!
      const xEntireDomainAsTime = extent(scalesData, (d) => getXAsDate(d)) as [
        Date,
        Date
      ];

      const xEntireScale = scaleTime().domain(xEntireDomainAsTime);

      // y
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
        xEntireScale,
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
      fields.x.sorting,
      fields.x.useAbbreviations,
      xDimension,
      chartConfig.filters,
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
  xScaleInteraction.range([0, chartWidth]);
  xEntireScale.range([0, chartWidth]);
  yScale.range([chartHeight, 0]);

  // Colors
  const colors = useMemo(() => {
    return scaleOrdinal([]).domain([]);
  }, []);

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const xRef = xScale(getX(d)) as number;
    const xOffset = xScale.bandwidth() / 2;
    const yRef = yScale(Math.max(getY(d) ?? NaN, 0));
    const yAnchor = yRef;

    const yPlacement = "top";

    const getXPlacement = () => {
      if (xRef + xOffset * 2 > 0.75 * chartWidth) {
        return "left";
      } else if (xRef < 0.25 * chartWidth) {
        return "right";
      } else {
        return "center";
      }
    };
    const xPlacement = getXPlacement();

    const getXAnchor = () => {
      return xPlacement === "right"
        ? xRef
        : xPlacement === "center"
        ? xRef + xOffset
        : xRef + xOffset * 2;
    };
    const xAnchor = getXAnchor();
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
      placement: { x: xPlacement, y: yPlacement },
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
    xEntireScale,
    xScaleInteraction,
    yScale,
    colors,
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
