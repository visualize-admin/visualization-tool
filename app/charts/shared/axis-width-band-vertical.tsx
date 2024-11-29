import { axisLeft } from "d3-axis";
import { useEffect, useRef } from "react";

import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useTimeFormatUnit } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";

export const AxisWidthBand = () => {
  const ref = useRef<SVGGElement>(null);
  const state = useChartState() as BarsState;
  const { xScale, getYLabel, yTimeUnit, yScale, bounds } = state;
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const formatDate = useTimeFormatUnit();
  const { chartHeight, margins } = bounds;
  const { labelColor, gridColor, labelFontSize, fontFamily, domainColor } =
    useChartTheme();

  useEffect(() => {
    if (ref.current) {
      const hasNegativeValues = xScale.domain()[0] < 0;
      const fontSize =
        yScale.bandwidth() > labelFontSize ? labelFontSize : yScale.bandwidth();
      const axis = axisLeft(yScale)
        .tickSizeOuter(0)
        .tickSizeInner(hasNegativeValues ? -chartHeight : 6);
      // .tickPadding(rotation ? -10 : 0);

      if (yTimeUnit) {
        axis.tickFormat((d) => formatDate(d, yTimeUnit));
      } else {
        axis.tickFormat((d) => getYLabel(d));
      }

      const g = renderContainer(ref.current, {
        id: "axis-width-band-vertical",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.attr("data-testid", "axis-width-band").call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.select(".domain").remove();
      g.selectAll(".tick line").attr(
        "stroke",
        hasNegativeValues ? gridColor : domainColor
      );
      g.selectAll(".tick text")
        .attr("x", 0)
        .attr("font-size", fontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor)
        .attr("text-anchor", "unset");
    }
  }, [
    chartHeight,
    domainColor,
    enableTransition,
    fontFamily,
    formatDate,
    getYLabel,
    gridColor,
    labelColor,
    labelFontSize,
    margins.left,
    margins.top,
    transitionDuration,
    xScale,
    yTimeUnit,
    yScale,
  ]);

  return <g ref={ref} />;
};

export const AxisWidthBandDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { xScale, yScale, bounds, minY } = useChartState() as BarsState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();

  useEffect(() => {
    if (ref.current) {
      const axis = axisLeft(yScale).tickSizeOuter(0);
      const g = renderContainer(ref.current, {
        id: "axis-width-band-vertical-domain",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.selectAll(".tick line").remove();
      g.selectAll(".tick text").remove();
      g.select(".domain")
        .attr(
          "transform",
          `translate(0, -${chartHeight - (yScale(minY) || 0)})`
        )
        .attr("stroke", domainColor);
    }
  }, [
    minY,
    bounds.chartHeight,
    chartHeight,
    domainColor,
    enableTransition,
    margins.left,
    margins.top,
    transitionDuration,
    xScale,
    yScale,
  ]);

  return <g ref={ref} />;
};
