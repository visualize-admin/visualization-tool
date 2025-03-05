import { max } from "d3-array";
import { ScaleLinear } from "d3-scale";
import { useMemo } from "react";

import {
  getAxisTitleSize,
  SINGLE_LINE_AXIS_LABEL_HEIGHT,
} from "@/charts/combo/shared";
import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import { getTickNumber } from "@/charts/shared/ticks";
import { TICK_FONT_SIZE, useChartTheme } from "@/charts/shared/use-chart-theme";
import { Bounds, Margins } from "@/charts/shared/use-size";
import { CHART_GRID_MIN_HEIGHT } from "@/components/react-grid";
import {
  ChartConfig,
  DashboardFiltersConfig,
  hasChartConfigs,
  isLayoutingFreeCanvas,
  useConfiguratorState,
} from "@/configurator";
import { getTextWidth } from "@/utils/get-text-width";

type ComputeChartPaddingProps = {
  xLabelPresent?: boolean;
  yScale: ScaleLinear<number, number>;
  width: number;
  height: number;
  interactiveFiltersConfig: ChartConfig["interactiveFiltersConfig"];
  animationPresent?: boolean;
  formatNumber: (n: number) => string;
  bandDomain?: string[];
  normalize?: boolean;
  //Chart is flipped in the case of bar charts where the position of the axes is inverted
  isFlipped?: boolean;
};

const computeChartPadding = (
  props: ComputeChartPaddingProps & {
    dashboardFilters: DashboardFiltersConfig | undefined;
  }
) => {
  const {
    xLabelPresent,
    yScale,
    height,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
    dashboardFilters,
    isFlipped,
  } = props;

  // Fake ticks to compute maximum tick length as
  // we need to take into account n between [0, 1] where numbers
  // with decimals have greater text length than the extremes.
  const fakeTicks = yScale.ticks(getTickNumber(height));
  const minLeftTickWidth =
    !!interactiveFiltersConfig?.calculation.active || normalize
      ? getTextWidth("100%", { fontSize: TICK_FONT_SIZE }) + TICK_PADDING
      : 0;
  const left = Math.max(
    ...fakeTicks.map(
      (x) =>
        getTextWidth(formatNumber(x), { fontSize: TICK_FONT_SIZE }) +
        TICK_PADDING
    ),
    minLeftTickWidth
  );

  const interactiveBottomElement =
    (!dashboardFilters?.timeRange.active &&
      !!interactiveFiltersConfig?.timeRange.active) ||
    animationPresent;

  let bottom = isFlipped
    ? 15 // Eyeballed value
    : 48;

  if (bandDomain?.length) {
    bottom +=
      max(bandDomain, (d) => getTextWidth(d, { fontSize: TICK_FONT_SIZE })) ??
      70;
  }

  const margins = isFlipped
    ? { bottom: left + (xLabelPresent ? 20 : 0), left: bottom }
    : { left, bottom: bottom + (xLabelPresent ? 20 : 0) };

  if (interactiveBottomElement) {
    bottom += BRUSH_BOTTOM_SPACE;
  }

  return margins;
};

export const useChartPadding = (props: ComputeChartPaddingProps) => {
  const {
    xLabelPresent,
    yScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
    isFlipped,
  } = props;
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  return useMemo(() => {
    return computeChartPadding({
      xLabelPresent,
      yScale,
      width,
      height,
      interactiveFiltersConfig,
      animationPresent,
      formatNumber,
      bandDomain,
      normalize,
      dashboardFilters,
      isFlipped,
    });
  }, [
    xLabelPresent,
    yScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
    dashboardFilters,
    isFlipped,
  ]);
};

const ASPECT_RATIO = 2 / 5;

type YAxisLabels = {
  leftLabel?: string;
  rightLabel?: string;
};

type ChartWidth = number & { __chartWidth: true };

export const getChartWidth = ({
  width,
  left,
  right,
}: {
  width: number;
  left: number;
  right: number;
}): ChartWidth => {
  return (width - left - right) as ChartWidth;
};

export const useChartBounds = ({
  width,
  chartWidth,
  height,
  margins,
  yAxisLabels,
}: {
  width: number;
  chartWidth: ChartWidth;
  height: number;
  margins: Margins;
  yAxisLabels?: YAxisLabels;
}): Bounds & { yAxisTitleHeight: number } => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const { top, bottom } = margins;
  const yAxisTitleHeight = useMemo(() => {
    const leftAxisTitle = yAxisLabels?.leftLabel;
    const rightAxisTitle = yAxisLabels?.rightLabel;

    if (!leftAxisTitle && !rightAxisTitle) {
      return 0;
    }

    const leftAxisTitleSize = getAxisTitleSize(leftAxisTitle ?? "", {
      width: chartWidth,
    });
    const rightAxisTitleSize = getAxisTitleSize(rightAxisTitle ?? "", {
      width: chartWidth,
    });

    return (
      Math.max(leftAxisTitleSize.height, rightAxisTitleSize.height) -
      SINGLE_LINE_AXIS_LABEL_HEIGHT
    );
  }, [chartWidth, yAxisLabels]);

  const chartHeight = isLayoutingFreeCanvas(state)
    ? Math.max(
        Math.max(40, CHART_GRID_MIN_HEIGHT - top - bottom),
        height - top - bottom
      )
    : chartWidth * ASPECT_RATIO;

  return {
    width,
    height: chartHeight + top + bottom,
    aspectRatio: ASPECT_RATIO,
    margins,
    chartWidth,
    chartHeight,
    yAxisTitleHeight,
  };
};

const LINE_HEIGHT = 1.25;

export const useAxisLabelHeightOffset = ({
  label,
  width,
  marginLeft,
  marginRight,
}: {
  label: string;
  width: number;
  marginLeft: number;
  marginRight: number;
}) => {
  const { axisLabelFontSize: fontSize } = useChartTheme();
  const labelWidth = getTextWidth(label, { fontSize });
  const lines = Math.ceil(labelWidth / (width - marginLeft - marginRight));

  return {
    height: fontSize * LINE_HEIGHT * lines,
    offset: fontSize * LINE_HEIGHT * (lines - 1),
    labelWidth,
  };
};
