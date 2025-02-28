import { axisBottom } from "d3-axis";
import { useEffect, useRef } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useTimeFormatUnit } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";

import {
  useAxisLabelHeightOffset,
  useXAxisTitleOffset,
} from "./chart-dimensions";

export const AxisWidthBand = () => {
  const ref = useRef<SVGGElement>(null);
  const state = useChartState() as ColumnsState | ComboLineColumnState;
  const {
    xScale,
    getXLabel,
    xDimension,
    xTimeUnit,
    yScale,
    bounds,
    xAxisLabel,
  } = state;
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const formatDate = useTimeFormatUnit();
  const { chartHeight, chartWidth, margins } = bounds;
  const xAxisTitleOffset = useXAxisTitleOffset();

  const {
    labelColor,
    gridColor,
    labelFontSize,
    fontFamily,
    axisLabelFontSize,
    domainColor,
  } = useChartTheme();

  useEffect(() => {
    if (ref.current) {
      const rotation = true;
      const hasNegativeValues = yScale.domain()[0] < 0;
      const fontSize =
        xScale.bandwidth() > labelFontSize ? labelFontSize : xScale.bandwidth();
      const axis = axisBottom(xScale)
        .tickSizeOuter(0)
        .tickSizeInner(hasNegativeValues ? -chartHeight : 6)
        .tickPadding(rotation ? -10 : 0);

      if (xTimeUnit) {
        axis.tickFormat((d) => formatDate(d, xTimeUnit));
      } else {
        axis.tickFormat((d) => getXLabel(d));
      }

      const g = renderContainer(ref.current, {
        id: "axis-width-band",
        transform: `translate(${margins.left} ${chartHeight + margins.top})`,
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
        .attr("transform", rotation ? "rotate(90)" : "rotate(0)")
        .attr("x", rotation ? fontSize : 0)
        .attr("font-size", fontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor)
        .attr("text-anchor", rotation ? "start" : "unset");
    }
  }, [
    chartHeight,
    domainColor,
    enableTransition,
    fontFamily,
    formatDate,
    getXLabel,
    gridColor,
    labelColor,
    labelFontSize,
    margins.left,
    margins.top,
    transitionDuration,
    xScale,
    xTimeUnit,
    yScale,
  ]);

  const { height, labelWidth } = useAxisLabelHeightOffset({
    label: xAxisLabel,
    width: chartWidth,
    marginLeft: margins.left,
    marginRight: margins.right,
  });

  return (
    <>
      <foreignObject
        x={margins.left + chartWidth / 2 - labelWidth / 2}
        y={margins.top + chartHeight + xAxisTitleOffset}
        width={chartWidth}
        height={height}
        style={{ display: "flex", textAlign: "right" }}
      >
        <OpenMetadataPanelWrapper component={xDimension}>
          <span style={{ fontSize: axisLabelFontSize }}>{xAxisLabel}</span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
      <g ref={ref} />
    </>
  );
};

export const AxisWidthBandDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { xScale, yScale, bounds } = useChartState() as ColumnsState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();

  useEffect(() => {
    if (ref.current) {
      const axis = axisBottom(xScale).tickSizeOuter(0);
      const g = renderContainer(ref.current, {
        id: "axis-width-band-domain",
        transform: `translate(${margins.left} ${chartHeight + margins.top})`,
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
        .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
        .attr("stroke", domainColor);
    }
  }, [
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
