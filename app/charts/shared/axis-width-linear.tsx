import { axisBottom, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { OpenMetadataPanelWrapper } from "@/components/metadata-panel";
import { useFormatNumber } from "@/formatters";
import { DimensionMetadataFragment } from "@/graphql/query-hooks";
import { estimateTextWidth } from "@/utils/estimate-text-width";

export const AxisWidthLinear = () => {
  const formatNumber = useFormatNumber();
  const { xScale, bounds, xAxisLabel, xMeasure } =
    useChartState() as ScatterplotState;
  const { chartWidth, chartHeight, margins } = bounds;
  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();
  const ref = useRef<SVGGElement>(null);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const maxLabelLength = estimateTextWidth(formatNumber(xScale.domain()[1]));
    const ticks = Math.min(bounds.chartWidth / (maxLabelLength + 20), 4);
    const tickValues = xScale.ticks(ticks);
    const axis = axisBottom(xScale)
      .tickValues(tickValues)
      .tickSizeInner(-chartHeight)
      .tickSizeOuter(-chartHeight)
      .tickFormat(formatNumber);

    g.selectAll<SVGGElement, null>(".content")
      .data([null])
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "content")
            .attr(
              "transform",
              `translate(${margins.left}, ${chartHeight + margins.top})`
            )
            .call(axis),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(TRANSITION_DURATION)
              .attr(
                "transform",
                `translate(${margins.left}, ${chartHeight + margins.top})`
              )
              .call(axis)
          ),
        (exit) => exit.remove()
      );

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("dy", labelFontSize)
      .attr("text-anchor", "middle");
    g.select("path.domain").attr("stroke", gridColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <foreignObject
        x={margins.left}
        y={margins.top + chartHeight + 20}
        width={chartWidth}
        height={labelFontSize * 2}
        style={{ textAlign: "right" }}
      >
        <OpenMetadataPanelWrapper dim={xMeasure as DimensionMetadataFragment}>
          <span style={{ fontSize: labelFontSize }}>{xAxisLabel}</span>
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

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
    const axis = axisBottom(xScale).tickSizeOuter(0);

    g.selectAll<SVGGElement, null>(".content")
      .data([null])
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "content")
            .attr(
              "transform",
              `translate(${margins.left}, ${chartHeight + margins.top})`
            )
            .call(axis),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(TRANSITION_DURATION)
              .attr(
                "transform",
                `translate(${margins.left}, ${chartHeight + margins.top})`
              )
              .call(axis)
          ),
        (exit) => exit.remove()
      );

    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
    g.select("path.domain")
      .attr("data-name", "width-axis-domain")
      .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
      .attr("stroke", domainColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return <g ref={ref} />;
};
