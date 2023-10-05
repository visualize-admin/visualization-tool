import * as d3 from "d3";
import React from "react";

import { PADDING_INNER, PADDING_OUTER } from "@/charts/column/constants";
import {
  ComboLineColumnStateVariables,
  useComboLineColumnStateData,
  useComboLineColumnStateVariables,
} from "@/charts/combo/combo-line-column-state-props";
import {
  adjustScales,
  getMargins,
  useCommonComboState,
  useYScales,
} from "@/charts/combo/combo-state";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
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
import { getTickNumber } from "@/charts/shared/ticks";
import { TICK_FONT_SIZE } from "@/charts/shared/use-chart-theme";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { Observer } from "@/charts/shared/use-width";
import { ComboLineColumnConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { useFormatFullDateAuto } from "@/formatters";
import { TimeUnit } from "@/graphql/resolver-types";
import { getTimeInterval } from "@/intervals";
import { getTextWidth } from "@/utils/get-text-width";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineColumnState = CommonChartState &
  ComboLineColumnStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineColumn";
    xKey: string;
    xScale: d3.ScaleBand<string>;
    xScaleTime: d3.ScaleTime<number, number>;
    xScaleInteraction: d3.ScaleBand<string>;
    yScale: d3.ScaleLinear<number, number>;
    yOrientationScales: {
      left: d3.ScaleLinear<number, number>;
      right: d3.ScaleLinear<number, number>;
    };
    colors: d3.ScaleOrdinal<string, string>;
    getColorLabel: (label: string) => string;
    chartWideData: ArrayLike<Observation>;
    getAnnotationInfo: (d: Observation) => TooltipInfo;
    maxRightTickWidth: number;
  };

const useComboLineColumnState = (
  chartProps: ChartProps<ComboLineColumnConfig> & { aspectRatio: number },
  variables: ComboLineColumnStateVariables,
  data: ChartStateData
): ComboLineColumnState => {
  const { chartConfig, aspectRatio } = chartProps;
  const { getX, getXAsDate } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const xKey = fields.x.componentIri;
  const {
    width,
    formatNumber,
    timeFormatUnit,
    chartWideData,
    xScaleTime,
    xScaleTimeRange,
    colors,
  } = useCommonComboState({
    chartData,
    timeRangeData,
    getXAsDate,
    getXAsString: getX,
    xKey,
    yGetters: [variables.y.left, variables.y.right],
    computeTotal: false,
  });

  // x
  // We can only use TemporalDimension in ComboLineColumn chart (see UI encodings).
  const interval = getTimeInterval(variables.xTimeUnit as TimeUnit);
  const formatDate = useFormatFullDateAuto();
  const [xMin, xMax] = xScaleTime.domain() as [Date, Date];
  const xDomain = interval.range(xMin, xMax).concat(xMax).map(formatDate);
  const xScale = d3
    .scaleBand()
    .domain(xDomain)
    .paddingInner(PADDING_INNER)
    .paddingOuter(PADDING_OUTER);

  // y
  const { yScale: yScaleLeft, paddingYScale: paddingLeftYScale } = useYScales({
    scalesData,
    paddingData,
    getY: variables.y.left.getY,
    startAtZero: variables.y.left.chartType === "column",
  });
  const { yScale: yScaleRight, paddingYScale: paddingRightYScale } = useYScales(
    {
      scalesData,
      paddingData,
      getY: variables.y.right.getY,
      startAtZero: variables.y.right.chartType === "column",
    }
  );
  const [minLeftValue, maxLeftValue] = yScaleLeft.domain();
  const [minRightValue, maxRightValue] = yScaleRight.domain();
  const minValue = d3.min([minLeftValue, minRightValue]) ?? 0;
  const maxValue = d3.max([maxLeftValue, maxRightValue]) ?? 0;
  const yScale = d3.scaleLinear().domain([minValue, maxValue]).nice();
  const yOrientationScales = {
    left: yScaleLeft,
    right: yScaleRight,
  };

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingLeftYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    formatNumber,
    bandDomain: xDomain,
  });
  const fakeRightTicks = paddingRightYScale.ticks(
    getTickNumber(width * aspectRatio)
  );
  const maxRightTickWidth = Math.max(
    ...fakeRightTicks.map(
      (d) =>
        getTextWidth(formatNumber(d), { fontSize: TICK_FONT_SIZE }) +
        TICK_PADDING
    )
  );
  const right = Math.max(maxRightTickWidth, 40);
  const margins = getMargins({ left, right, bottom });
  const bounds = getChartBounds(width, margins, aspectRatio);
  const { chartWidth, chartHeight } = bounds;
  const xScales = [xScale, xScaleTime, xScaleTimeRange];
  const yScales = [yScale, yScaleLeft, yScaleRight];
  adjustScales(xScales, yScales, { chartWidth, chartHeight });

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const x = getX(d);
    const xScaled = (xScale(x) as number) + xScale.bandwidth() * 0.5;

    return {
      datum: { label: "", value: "0", color: "#006699" },
      xAnchor: xScaled,
      yAnchor:
        [variables.y.left, variables.y.right]
          .map(({ orientation, getY }) =>
            yOrientationScales[orientation](getY(d) ?? 0)
          )
          .reduce((a, b) => a + b, 0) * 0.5,
      xValue: timeFormatUnit(x, variables.xTimeUnit as TimeUnit),
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: xScaled,
        topAnchor: false,
      }),
      values: [variables.y.left, variables.y.right].map(
        ({ orientation, getY, label, chartType }) => {
          const y = getY(d);

          return {
            label,
            value: `${y}`,
            color: colors(label),
            hide: y === null,
            yPos: yOrientationScales[orientation](y ?? 0),
            symbol: chartType === "line" ? "line" : "square",
          };
        }
      ),
    } as TooltipInfo;
  };

  return {
    chartType: "comboLineColumn",
    xKey,
    bounds,
    maxRightTickWidth,
    chartData,
    allData,
    xScale,
    xScaleInteraction: xScale.copy().padding(0),
    xScaleTime,
    xScaleTimeRange,
    yScale,
    yOrientationScales,
    colors,
    getColorLabel: (label) => label,
    chartWideData,
    getAnnotationInfo,
    ...variables,
  };
};

const ComboLineColumnChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineColumnConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineColumnStateVariables(chartProps);
  const data = useComboLineColumnStateData(chartProps, variables);
  const state = useComboLineColumnState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineColumnChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineColumnConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineColumnChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
