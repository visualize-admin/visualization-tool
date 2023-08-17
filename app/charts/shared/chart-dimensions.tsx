import { max } from "d3";
import { useMemo } from "react";

import { TICK_PADDING } from "@/charts/shared/axis-height-linear";
import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import { getTickNumber } from "@/charts/shared/ticks";
import { Bounds, Margins } from "@/charts/shared/use-width";
import { ChartConfig } from "@/configurator";
import { estimateTextWidth } from "@/utils/estimate-text-width";

type ComputeChartPaddingProps = {
  allYScale: d3.ScaleLinear<number, number>;
  width: number;
  aspectRatio: number;
  interactiveFiltersConfig: ChartConfig["interactiveFiltersConfig"];
  animationPresent?: boolean;
  formatNumber: (n: number) => string;
  bandDomain?: string[];
  normalize?: boolean;
};

const computeChartPadding = (props: ComputeChartPaddingProps) => {
  const {
    allYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
  } = props;
  // Fake ticks to compute maximum tick length as
  // we need to take into account n between [0, 1] where numbers
  // with decimals have greater text length than the extremes.
  // Width * aspectRatio is taken as an approximation of chartHeight
  // since we do not have access to chartHeight yet.
  const fakeTicks = allYScale.ticks(getTickNumber(width * aspectRatio));
  const minLeftTickWidth =
    !!interactiveFiltersConfig?.calculation.active || normalize
      ? estimateTextWidth("100%")
      : 0;
  const left = Math.max(
    ...fakeTicks.map((x) => estimateTextWidth(formatNumber(x)) + TICK_PADDING),
    minLeftTickWidth
  );

  let bottom =
    interactiveFiltersConfig?.timeRange.active || animationPresent
      ? BRUSH_BOTTOM_SPACE
      : 40;

  if (bandDomain?.length) {
    bottom += max(bandDomain, (d) => estimateTextWidth(d)) ?? 70;
  }

  return { left, bottom };
};

export const useChartPadding = (props: ComputeChartPaddingProps) => {
  const {
    allYScale,
    width,
    aspectRatio,
    interactiveFiltersConfig,
    animationPresent,
    formatNumber,
    bandDomain,
    normalize,
  } = props;

  return useMemo(() => {
    return computeChartPadding({
      allYScale,
      width,
      aspectRatio,
      interactiveFiltersConfig,
      animationPresent,
      formatNumber,
      bandDomain,
      normalize,
    });
  }, [
    allYScale,
    width,
    aspectRatio,
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
  aspectRatio: number
): Bounds => {
  const { left, top, right, bottom } = margins;

  const chartWidth = width - left - right;
  const chartHeight = chartWidth * aspectRatio;

  return {
    width,
    height: chartHeight + top + bottom,
    margins,
    chartWidth,
    chartHeight,
  };
};
