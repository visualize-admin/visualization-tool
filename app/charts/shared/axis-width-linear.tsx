import { axisBottom } from "d3-axis";
import { useEffect, useRef } from "react";

import { GroupedBarsState } from "@/charts/bar/bars-grouped-state";
import { StackedBarsState } from "@/charts/bar/bars-stacked-state";
import { BarsState } from "@/charts/bar/bars-state";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useXAxisTitleOffset } from "@/charts/shared/chart-dimensions";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatNumber } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";
import { getTextWidth } from "@/utils/get-text-width";

export const AxisWidthLinear = () => {
  const formatNumber = useFormatNumber();
  const {
    xScale,
    bounds,
    xAxisLabel,
    xMeasure,
    chartType,
    bottomAxisLabelSize,
  } = useChartState() as
    | ScatterplotState
    | BarsState
    | GroupedBarsState
    | StackedBarsState;
  const { chartWidth, chartHeight, margins } = bounds;
  const {
    labelColor,
    labelFontSize,
    axisLabelFontSize,
    gridColor,
    fontFamily,
  } = useChartTheme();
  const xAxisTitleOffset = useXAxisTitleOffset();

  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);

  useEffect(() => {
    if (ref.current) {
      const maxLabelLength = getTextWidth(formatNumber(xScale.domain()[1]), {
        fontSize: labelFontSize,
      });
      const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 20), 4);
      const tickValues = xScale.ticks(ticks);
      const axis = axisBottom(xScale)
        .tickValues(tickValues)
        .tickSizeInner(-chartHeight - 10)
        .tickSizeOuter(-chartHeight)
        .tickFormat(formatNumber);
      const g = renderContainer(ref.current, {
        id: "axis-width-linear",
        transform: `translate(${margins.left} ${chartHeight + margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.selectAll(".tick line")
        .attr("y1", 10)
        .attr("stroke", (_, i) => (i === 0 ? "#000000" : gridColor))
        .attr("stroke-width", 1);
      g.selectAll(".tick text")
        .attr("font-size", labelFontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor)
        .attr("dy", labelFontSize + 10)
        .attr("text-anchor", "middle");
      g.select("path.domain").attr("stroke", gridColor);
      if (chartType === "bar") {
        g.select("path.domain").remove();
      }
    }
  }, [
    chartType,
    bounds.chartWidth,
    chartHeight,
    enableTransition,
    fontFamily,
    formatNumber,
    gridColor,
    labelColor,
    labelFontSize,
    margins.left,
    margins.top,
    transitionDuration,
    xScale,
  ]);

  return (
    <>
      <foreignObject
        x={margins.left + chartWidth / 2 - bottomAxisLabelSize.width / 2}
        y={margins.top + chartHeight + xAxisTitleOffset}
        width={chartWidth}
        height={bottomAxisLabelSize.height}
        style={{ display: "flex", textAlign: "right" }}
      >
        <OpenMetadataPanelWrapper component={xMeasure}>
          <span style={{ fontSize: axisLabelFontSize }}>{xAxisLabel}</span>
        </OpenMetadataPanelWrapper>
      </foreignObject>
      <g ref={ref} />
    </>
  );
};

export const AxisWidthLinearDomain = () => {
  const { xScale, yScale, bounds } = useChartState() as ScatterplotState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);

  useEffect(() => {
    if (ref.current) {
      const axis = axisBottom(xScale).tickSizeOuter(0);
      const g = renderContainer(ref.current, {
        id: "axis-width-linear-domain",
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
      g.select("path.domain")
        .attr("data-name", "width-axis-domain")
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
