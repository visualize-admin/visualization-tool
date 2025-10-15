import { axisBottom } from "d3-axis";
import { useEffect, useRef } from "react";

import { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import { ColumnsState } from "@/charts/column/columns-state";
import { ComboLineColumnState } from "@/charts/combo/combo-line-column-state";
import { useXAxisTitleOffset } from "@/charts/shared/chart-dimensions";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useTransitionStore } from "@/stores/transition";

export const AxisWidthBand = () => {
  const ref = useRef<SVGGElement>(null);
  const {
    xScale,
    getXLabel,
    xDimension,
    xTimeUnit,
    formatXDate,
    yScale,
    bounds: { chartHeight, chartWidth, margins },
    xAxisLabel,
    bottomAxisLabelSize,
    formatXAxisTick,
  } = useChartState() as
    | ColumnsState
    | StackedColumnsState
    | GroupedColumnsState
    | ComboLineColumnState;
  const {
    labelColor,
    gridColor,
    labelFontSize,
    fontFamily,
    axisLabelFontSize,
    domainColor,
  } = useChartTheme();
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const resolvedFontSize =
    xScale.bandwidth() > labelFontSize ? labelFontSize : xScale.bandwidth();
  const xAxisTitleOffset = useXAxisTitleOffset(
    xScale,
    getXLabel,
    xTimeUnit,
    resolvedFontSize
  );

  useEffect(() => {
    if (ref.current) {
      const rotation = true;
      const hasNegativeValues = yScale.domain()[0] < 0;
      const axis = axisBottom(xScale)
        .tickSizeOuter(0)
        .tickSizeInner(hasNegativeValues ? -chartHeight : 6)
        .tickPadding(rotation ? -10 : 0)
        .tickFormat(formatXAxisTick ?? ((tick) => tick));

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
        .attr(
          "x",
          rotation
            ? resolvedFontSize + (labelFontSize - resolvedFontSize) * 0.6
            : 0
        )
        .attr(
          "dy",
          hasNegativeValues
            ? resolvedFontSize + (labelFontSize - resolvedFontSize)
            : 0.6 * resolvedFontSize + (labelFontSize - resolvedFontSize) * 0.4
        )
        .attr("font-size", resolvedFontSize)
        .attr("font-family", fontFamily)
        .attr("fill", labelColor)
        .attr("text-anchor", rotation ? "start" : "unset");
    }
  }, [
    chartHeight,
    domainColor,
    enableTransition,
    fontFamily,
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
    formatXDate,
    formatXAxisTick,
    resolvedFontSize,
  ]);

  return (
    <>
      <foreignObject
        x={margins.left + chartWidth / 2 - bottomAxisLabelSize.width / 2}
        y={margins.top + chartHeight + xAxisTitleOffset + 8}
        width={chartWidth}
        height={bottomAxisLabelSize.height}
        style={{ display: "flex" }}
      >
        <OpenMetadataPanelWrapper component={xDimension}>
          <span style={{ fontSize: axisLabelFontSize, lineHeight: 1.5 }}>
            {xAxisLabel}
          </span>
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
