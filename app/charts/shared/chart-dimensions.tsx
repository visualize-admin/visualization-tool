import { max } from "d3-array";
import { useMemo } from "react";

import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import { getTickNumber } from "@/charts/shared/ticks";
import { TICK_FONT_SIZE } from "@/charts/shared/use-chart-theme";
import { Bounds, Margins } from "@/charts/shared/use-width";
import { ChartConfig } from "@/configurator";
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

const computeChartPadding = (props: ComputeChartPaddingProps) => {
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

  // Fake ticks to compute maximum tick length as
  // we need to take into account n between [0, 1] where numbers
  // with decimals have greater text length than the extremes.
  const fakeTicks = yScale.ticks(getTickNumber(width * height));
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
    interactiveFiltersConfig?.timeRange.active || animationPresent
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
  ]);
};

export const getChartBounds = (
  width: number,
  margins: Margins,
  height: number
): Bounds => {
  const { left, top, right, bottom } = margins;

  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;

  return {
    width,
    height: chartHeight + top + bottom,
    aspectRatio: chartHeight / chartWidth,
    margins,
    chartWidth,
    chartHeight,
  };
};
