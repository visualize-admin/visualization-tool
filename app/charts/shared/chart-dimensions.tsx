import { max } from "d3";
import { useMemo } from "react";

import { BRUSH_BOTTOM_SPACE } from "@/charts/shared/brush/constants";
import { getTickNumber } from "@/charts/shared/ticks";
import { Bounds, Margins } from "@/charts/shared/use-width";
import { ChartConfig } from "@/configurator";
import { estimateTextWidth } from "@/utils/estimate-text-width";

const computeChartPadding = (
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  aspectRatio: number,
  interactiveFiltersConfig: ChartConfig["interactiveFiltersConfig"],
  formatNumber: (n: number) => string,
  bandDomain?: string[],
  normalize?: boolean
) => {
  // Fake ticks to compute maximum tick length as
  // we need to take into account n between [0, 1] where numbers
  // with decimals have greater text length than the extremes.
  // Width * aspectRatio is taken as an approximation of chartHeight
  // since we do not have access to chartHeight yet.
  const fakeTicks = yScale.ticks(getTickNumber(width * aspectRatio));
  const left = Math.max(
    ...fakeTicks.map((x) =>
      estimateTextWidth(`${formatNumber(x)}${normalize ? "%" : ""}`)
    )
  );

  let bottom = interactiveFiltersConfig?.timeRange.active
    ? BRUSH_BOTTOM_SPACE
    : 30;

  if (bandDomain?.length) {
    bottom += max(bandDomain, (d) => estimateTextWidth(d) || 70)!;
  }

  return { left, bottom };
};

export const useChartPadding = (
  yScale: d3.ScaleLinear<number, number>,
  width: number,
  aspectRatio: number,
  interactiveFiltersConfig: ChartConfig["interactiveFiltersConfig"],
  formatNumber: (n: number) => string,
  bandDomain?: string[],
  normalize?: boolean
) => {
  return useMemo(
    () =>
      computeChartPadding(
        yScale,
        width,
        aspectRatio,
        interactiveFiltersConfig,
        formatNumber,
        bandDomain,
        normalize
      ),
    [
      yScale,
      width,
      aspectRatio,
      interactiveFiltersConfig,
      formatNumber,
      bandDomain,
      normalize,
    ]
  );
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
