import { axisLeft, NumberValue } from "d3";
import React, { useEffect, useRef } from "react";

import type { AreasState } from "@/charts/area/areas-state";
import type { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import type { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import type { ColumnsState } from "@/charts/column/columns-state";
import type { LinesState } from "@/charts/line/lines-state";
import type { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import {
  maybeTransition,
  renderContainer,
} from "@/charts/shared/rendering-utils";
import { getTickNumber } from "@/charts/shared/ticks";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { useInteractiveFilters } from "@/stores/interactive-filters";
import { useTransitionStore } from "@/stores/transition";
import { getTextWidth } from "@/utils/get-text-width";

export const TICK_PADDING = 6;

export const TICK_PADDING = 6;

export const AxisHeightLinear = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const calculationType = useInteractiveFilters((d) => d.calculation.type);
  const normalized = calculationType === "percent";

  // FIXME: add "NumericalY" chart type here.
  const { yScale, yAxisLabel, yMeasure, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | GroupedColumnsState
    | StackedColumnsState
    | LinesState
    | ScatterplotState;
  const { margins } = bounds;

  const ticks = getTickNumber(bounds.chartHeight);
  const tickFormat = React.useCallback(
    (d: NumberValue) => {
      return normalized ? `${formatNumber(d)}%` : formatNumber(d);
    },
    [formatNumber, normalized]
  );

  const {
    labelColor,
    labelFontSize,
    axisLabelFontSize,
    gridColor,
    fontFamily,
  } = useChartTheme();
  const titleWidth =
    getTextWidth(yAxisLabel, {
      fontSize: axisLabelFontSize,
    }) + TICK_PADDING;

  useEffect(() => {
    if (ref.current) {
      const axis = axisLeft(yScale)
        .ticks(ticks)
        .tickSizeInner(-bounds.chartWidth)
        .tickFormat(tickFormat)
        .tickPadding(TICK_PADDING);
      const g = renderContainer(ref.current, {
        id: "axis-height-linear",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.select(".domain").remove();
      g.selectAll(".tick line")
        .attr("stroke", gridColor)
        .attr("stroke-width", 1);
      g.selectAll(".tick text")
        .attr("dy", 3)
        .attr("fill", labelColor)
        .attr("font-family", fontFamily)
        .style("font-size", labelFontSize)
        .attr("text-anchor", "end");
    }
  }, [
    bounds.chartWidth,
    enableTransition,
    fontFamily,
    gridColor,
    labelColor,
    labelFontSize,
    margins.left,
    margins.top,
    tickFormat,
    ticks,
    transitionDuration,
    yScale,
  ]);

  return (
    <>
      {/* TODO: at some point it would make sense to allow wrapping */}
      <foreignObject width={titleWidth} height={axisLabelFontSize * 2}>
        <OpenMetadataPanelWrapper dim={yMeasure as DimensionMetadataFragment}>
          <span style={{ fontSize: axisLabelFontSize }}>{yAxisLabel}</span>
        </OpenMetadataPanelWrapper>
      </foreignObject>

      <g ref={ref} />
    </>
  );
};

export const AxisHeightLinearDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { xScale, yScale, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;
  const { margins } = bounds;
  const { domainColor } = useChartTheme();

  useEffect(() => {
    if (ref.current) {
      const axis = axisLeft(yScale).tickSizeOuter(0);
      const g = renderContainer(ref.current, {
        id: "axis-height-linear-domain",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g) => g.call(axis),
        renderUpdate: (g, opts) =>
          maybeTransition(g, {
            transition: opts.transition,
            s: (g) => g.call(axis),
          }),
      });

      g.select(".domain")
        .attr("data-name", "height-axis-domain")
        .attr("transform", `translate(${xScale(0 as $FixMe)}, 0)`)
        .attr("stroke", domainColor);
      g.selectAll(".tick line").remove();
      g.selectAll(".tick text").remove();
    }
  }, [
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
