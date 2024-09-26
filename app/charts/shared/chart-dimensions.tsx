import { max } from "d3-array";
import { useMemo } from "react";

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
  yScale: d3.ScaleLinear<number, number>;
  width: number;
  height: number;
  interactiveFiltersConfig: ChartConfig["interactiveFiltersConfig"];
  animationPresent?: boolean;
  formatNumber: (n: number) => string;
  bandDomain?: string[];
  normalize?: boolean;
};

const computeChartPadding = (
  props: ComputeChartPaddingProps & {
    dashboardFilters: DashboardFiltersConfig | undefined;
  }
) => {
  const {
    yScale,
    height,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
    dashboardFilters,
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

  let bottom =
    (!dashboardFilters?.timeRange.active &&
      !!interactiveFiltersConfig?.timeRange.active) ||
    animationPresent
      ? BRUSH_BOTTOM_SPACE
      : 48;

  if (bandDomain?.length) {
    bottom +=
      max(bandDomain, (d) => getTextWidth(d, { fontSize: TICK_FONT_SIZE })) ??
      70;
  }

  return { left, bottom };
};

export const useChartPadding = (props: ComputeChartPaddingProps) => {
  const {
    yScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
  } = props;
  const [{ dashboardFilters }] = useConfiguratorState(hasChartConfigs);
  return useMemo(() => {
    return computeChartPadding({
      yScale,
      width,
      height,
      interactiveFiltersConfig,
      animationPresent,
      formatNumber,
      bandDomain,
      normalize,
      dashboardFilters,
    });
  }, [
    yScale,
    width,
    height,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
    dashboardFilters,
  ]);
};

const ASPECT_RATIO = 2 / 5;

export const useChartBounds = (
  width: number,
  margins: Margins,
  height: number
): Bounds => {
  const [state] = useConfiguratorState(hasChartConfigs);
  const { left, top, right, bottom } = margins;

  const chartWidth = width - left - right;
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
  };
};

const LINE_HEIGHT = 1.25;

export const useAxisLabelHeight = ({
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
  return fontSize * LINE_HEIGHT * lines;
};
