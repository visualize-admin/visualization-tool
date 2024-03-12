import * as d3 from "d3";
import React from "react";

import {
  ComboLineDualStateVariables,
  useComboLineDualStateData,
  useComboLineDualStateVariables,
} from "@/charts/combo/combo-line-dual-state-props";
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
import { ComboLineDualConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { getTextWidth } from "@/utils/get-text-width";

import { ChartProps } from "../shared/ChartProps";

export type ComboLineDualState = CommonChartState &
  ComboLineDualStateVariables &
  InteractiveXTimeRangeState & {
    chartType: "comboLineDual";
    xKey: string;
    xScale: d3.ScaleTime<number, number>;
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

const useComboLineDualState = (
  chartProps: ChartProps<ComboLineDualConfig> & { aspectRatio: number },
  variables: ComboLineDualStateVariables,
  data: ChartStateData
): ComboLineDualState => {
  const { chartConfig, aspectRatio } = chartProps;
  const { xDimension, getX, getXAsString } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const xKey = fields.x.componentIri;
  const {
    width,
    formatNumber,
    timeFormatUnit,
    chartWideData,
    xScaleTime: xScale,
    xScaleTimeRange,
    colors,
  } = useCommonComboState({
    chartData,
    timeRangeData,
    getXAsDate: getX,
    getXAsString,
    xKey,
    yGetters: [variables.y.left, variables.y.right],
    computeTotal: false,
  });

  // y
  const { yScale: yScaleLeft, paddingYScale: paddingLeftYScale } = useYScales({
    scalesData,
    paddingData,
    getY: variables.y.left.getY,
  });
  const { yScale: yScaleRight, paddingYScale: paddingRightYScale } = useYScales(
    {
      scalesData,
      paddingData,
      getY: variables.y.right.getY,
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
  const xScales = [xScale, xScaleTimeRange];
  const yScales = [yScale, yScaleLeft, yScaleRight];
  adjustScales(xScales, yScales, { chartWidth, chartHeight });

  // Tooltip
  const getAnnotationInfo = (d: Observation): TooltipInfo => {
    const x = getX(d);
    const xScaled = xScale(x);

    const values = [variables.y.left, variables.y.right]
      .map(({ orientation, getY, label }) => {
        const y = getY(d);
        const yPos = yOrientationScales[orientation](y ?? 0);
        if (!Number.isFinite(y) || y === null) {
          return null;
        }

        return {
          label,
          value: `${y}`,
          color: colors(label),
          hide: y === null,
          yPos: yPos,
          symbol: "line",
        };
      })
      .filter(truthy);
    const yAnchor = d3.mean(values.map((d) => d.yPos));

    return {
      datum: { label: "", value: "0", color: d3.schemeCategory10[0] },
      xAnchor: xScaled,
      yAnchor: yAnchor,
      xValue: timeFormatUnit(x, xDimension.timeUnit),
      placement: getCenteredTooltipPlacement({
        chartWidth,
        xAnchor: xScaled,
        topAnchor: false,
      }),
      values,
    } as TooltipInfo;
  };

  return {
    chartType: "comboLineDual",
    xKey,
    bounds,
    maxRightTickWidth,
    chartData,
    allData,
    xScale,
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

const ComboLineDualChartProvider = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineDualConfig> & { aspectRatio: number }
  >
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineDualStateVariables(chartProps);
  const data = useComboLineDualStateData(chartProps, variables);
  const state = useComboLineDualState(chartProps, variables, data);

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineDualChart = (
  props: React.PropsWithChildren<
    ChartProps<ComboLineDualConfig> & { aspectRatio: number }
  >
) => {
  return (
    <Observer>
      <InteractionProvider>
        <ComboLineDualChartProvider {...props} />
      </InteractionProvider>
    </Observer>
  );
};
