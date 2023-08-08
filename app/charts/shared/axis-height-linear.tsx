import { axisLeft, NumberValue, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import type { AreasState } from "@/charts/area/areas-state";
import type { GroupedColumnsState } from "@/charts/column/columns-grouped-state";
import type { StackedColumnsState } from "@/charts/column/columns-stacked-state";
import type { ColumnsState } from "@/charts/column/columns-state";
import type { LinesState } from "@/charts/line/lines-state";
import type { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";
import { getTickNumber } from "@/charts/shared/ticks";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { useInteractiveFiltersStore } from "@/stores/interactive-filters";
import { estimateTextWidth } from "@/utils/estimate-text-width";

export const AxisHeightLinear = () => {
  const ref = useRef<SVGGElement>(null);
  const formatNumber = useFormatNumber({ decimals: "auto" });
  const calculationType = useInteractiveFiltersStore((d) => d.calculation.type);
  const normalized = calculationType === "percent";

  // FIXME: add "NumericalY" chart type here.
  const { yScale, yAxisLabel, yMeasure, bounds } = useChartState() as
    | AreasState
    | ColumnsState
    | GroupedColumnsState
    | StackedColumnsState
    | LinesState
    | ScatterplotState;

  const ticks = getTickNumber(bounds.chartHeight);
  const tickFormat = normalized
    ? (d: NumberValue) => `${formatNumber(d)}%`
    : formatNumber;

  const {
    labelColor,
    labelFontSize,
    axisLabelFontSize,
    gridColor,
    fontFamily,
  } = useChartTheme();
  const titleWidth = estimateTextWidth(yAxisLabel, axisLabelFontSize);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const axis = axisLeft(yScale)
      .ticks(ticks)
      .tickSizeInner(-bounds.chartWidth)
      .tickFormat(tickFormat)
      .tickPadding(6);

    g.selectAll<SVGGElement, null>(".content")
      .data([null])
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "content")
            .attr(
              "transform",
              `translate(${bounds.margins.left}, ${bounds.margins.top})`
            )
            .call(axis),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(TRANSITION_DURATION)
              .attr(
                "transform",
                `translate(${bounds.margins.left}, ${bounds.margins.top})`
              )
              .call(axis)
          ),
        (exit) => exit.remove()
      );

    g.select(".domain").remove();
    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("dy", 3)
      .attr("fill", labelColor)
      .attr("font-family", fontFamily)
      .style("font-size", labelFontSize)
      .attr("text-anchor", "end");
  };

  useEffect(() => {
    if (ref.current) {
      select<SVGGElement, unknown>(ref.current).call(mkAxis);
    }
  });

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
  const { xScale, yScale, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;
  const { domainColor } = useChartTheme();

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    const axis = axisLeft(yScale).tickSizeOuter(0);

    g.selectAll<SVGGElement, null>(".content")
      .data([null])
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "content")
            .attr(
              "transform",
              `translate(${bounds.margins.left}, ${bounds.margins.top})`
            )
            .call((g) =>
              g.transition().duration(TRANSITION_DURATION).call(axis)
            ),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(TRANSITION_DURATION)
              .attr(
                "transform",
                `translate(${bounds.margins.left}, ${bounds.margins.top})`
              )
              .call((g) =>
                g.transition().duration(TRANSITION_DURATION).call(axis)
              )
          ),
        (exit) => exit.remove()
      );

    g.select(".domain")
      .attr("data-name", "height-axis-domain")
      .attr("transform", `translate(${xScale(0 as $FixMe)}, 0)`)
      .attr("stroke", domainColor);
    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return <g ref={ref} />;
};
