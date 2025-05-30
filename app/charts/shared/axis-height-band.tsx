import { axisLeft } from "d3-axis";
import { useEffect, useRef } from "react";

import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useTimeFormatUnit } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";

export const AxisHeightBand = () => {
  const ref = useRef<SVGGElement>(null);
  const {
    xScale,
    getYLabel,
    yTimeUnit,
    yScale,
    bounds,
    yDimension,
    leftAxisLabelSize,
    leftAxisLabelOffsetTop,
    formatYAxisTick,
  } = useChartState() as BarsState | GroupedBarsState | StackedBarsState;
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const formatDate = useTimeFormatUnit();
  const { chartHeight, margins } = bounds;
  const {
    labelColor,
    axisLabelFontSize,
    gridColor,
    labelFontSize,
    fontFamily,
    domainColor,
  } = useChartTheme();
  const bandwidth = yScale.bandwidth();
  const fontSize = bandwidth > labelFontSize ? labelFontSize : bandwidth;

  useEffect(() => {
    if (ref.current) {
      const hasNegativeValues = xScale.domain()[0] < 0;
      const axis = axisLeft(yScale)
        .tickSizeOuter(0)
        .tickSizeInner(hasNegativeValues ? -chartHeight : 6)
        .tickFormat(formatYAxisTick ?? ((tick) => tick));

      const g = renderContainer(ref.current, {
        id: "axis-height-band",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.attr("data-testid", "axis-height-band").call(axis),
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
    fontSize,
    formatYAxisTick,
  ]);

  return (
    <>
      <g ref={ref} />
      <foreignObject
        y={leftAxisLabelOffsetTop}
        width={leftAxisLabelSize.width}
        height={leftAxisLabelSize.height}
        style={{ display: "flex" }}
      >
        <OpenMetadataPanelWrapper>
          <span style={{ fontSize: axisLabelFontSize, lineHeight: 1.5 }}>
            {yDimension.label}
          </span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
    </>
  );
};

export const AxisHeightBandDomain = () => {
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
        id: "axis-height-band-domain",
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
        .attr("transform", `translate(0, 0)`)
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
