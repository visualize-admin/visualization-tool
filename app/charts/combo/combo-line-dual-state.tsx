import { max, mean, min } from "d3-array";
import { scaleLinear } from "d3-scale";
import { schemeCategory10 } from "d3-scale-chromatic";
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
import { getTickNumber } from "@/charts/shared/ticks";
import { TICK_FONT_SIZE, useChartTheme } from "@/charts/shared/use-chart-theme";
import { InteractionProvider } from "@/charts/shared/use-interaction";
import { ComboLineDualConfig } from "@/configurator";
import { Observation } from "@/domain/data";
import { truthy } from "@/domain/types";
import { getTextWidth } from "@/utils/get-text-width";
import { useAxisTitleAdjustments } from "@/utils/use-axis-title-adjustments";
import { useIsMobile } from "@/utils/use-is-mobile";

import { ChartProps } from "../shared/ChartProps";

import { TITLE_VPADDING } from "./combo-line-container";

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
  chartProps: ChartProps<ComboLineDualConfig>,
  variables: ComboLineDualStateVariables,
  data: ChartStateData
): ComboLineDualState => {
  const { chartConfig } = chartProps;
  const { xDimension, getX, getXAsString } = variables;
  const { chartData, scalesData, timeRangeData, paddingData, allData } = data;
  const { fields, interactiveFiltersConfig } = chartConfig;
  const xKey = fields.x.componentId;
  const {
    width,
    height,
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
    getMinY: variables.y.left.getMinY,
  });
  const { yScale: yScaleRight, paddingYScale: paddingRightYScale } = useYScales(
    {
      scalesData,
      paddingData,
      getY: variables.y.right.getY,
      getMinY: variables.y.right.getMinY,
    }
  );

  const [minLeftValue, maxLeftValue] = yScaleLeft.domain();
  const [minRightValue, maxRightValue] = yScaleRight.domain();
  const minValue = min([minLeftValue, minRightValue]) ?? 0;
  const maxValue = max([maxLeftValue, maxRightValue]) ?? 0;
  const yScale = scaleLinear().domain([minValue, maxValue]).nice();
  const yOrientationScales = {
    left: yScaleLeft,
    right: yScaleRight,
  };

  // Dimensions
  const { left, bottom } = useChartPadding({
    yScale: paddingLeftYScale,
    width,
    height,
    interactiveFiltersConfig,
    formatNumber,
  });
  const fakeRightTicks = paddingRightYScale.ticks(getTickNumber(height));
  const maxRightTickWidth = Math.max(
    ...fakeRightTicks.map(
      (d) =>
        getTextWidth(formatNumber(d), { fontSize: TICK_FONT_SIZE }) +
        TICK_PADDING
    )
  );

  const { topMarginAxisTitleAdjustment } = useAxisTitleAdjustments({
    leftAxisTitle: variables.y.left.label,
    rightAxisTitle: variables.y.right.label,
    containerWidth: width,
  });

  const right = Math.max(maxRightTickWidth, 40);

  const margins = getMargins({
    left,
    right,
    bottom,
    top: topMarginAxisTitleAdjustment,
  });

  const bounds = useChartBounds(width, margins, height, {
    leftLabel: variables.y.left.label,
    rightLabel: variables.y.right.label,
  });

  const { chartWidth, chartHeight } = bounds;
  const xScales = [xScale, xScaleTimeRange];
  const yScales = [yScale, yScaleLeft, yScaleRight];
  adjustScales(xScales, yScales, { chartWidth, chartHeight });

  const isMobile = useIsMobile();

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
    const yAnchor = isMobile
      ? chartHeight + margins.bottom
      : mean(values.map((d) => d.yPos));
    const placement = isMobile
      ? MOBILE_TOOLTIP_PLACEMENT
      : getCenteredTooltipPlacement({
          chartWidth,
          xAnchor: xScaled,
          topAnchor: false,
        });

    return {
      datum: { label: "", value: "0", color: schemeCategory10[0] },
      xAnchor: xScaled,
      yAnchor: yAnchor,
      value: timeFormatUnit(x, xDimension.timeUnit),
      placement,
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
  props: React.PropsWithChildren<ChartProps<ComboLineDualConfig>>
) => {
  const { children, ...chartProps } = props;
  const variables = useComboLineDualStateVariables(chartProps);
  const data = useComboLineDualStateData(chartProps, variables);
  const state = useComboLineDualState(chartProps, variables, data);
  const { bounds, y } = state;

  const { axisLabelFontSize } = useChartTheme();
  const axisTitle = y["left"].label;
  const axisTitleWidth =
    getTextWidth(axisTitle, { fontSize: axisLabelFontSize }) + TICK_PADDING;
  const otherAxisTitle = y["right"].label;
  const otherAxisTitleWidth =
    getTextWidth(otherAxisTitle, { fontSize: axisLabelFontSize }) +
    TICK_PADDING;
  const overLappingTitles =
    axisTitleWidth + otherAxisTitleWidth > bounds.chartWidth;

  if (overLappingTitles) {
    bounds.height += axisLabelFontSize + TITLE_VPADDING; // Add space for the legend if titles are overlapping
  }

  return (
    <ChartContext.Provider value={state}>{children}</ChartContext.Provider>
  );
};

export const ComboLineDualChart = (
  props: React.PropsWithChildren<ChartProps<ComboLineDualConfig>>
) => {
  return (
    <InteractionProvider>
      <ComboLineDualChartProvider {...props} />
    </InteractionProvider>
  );
};
