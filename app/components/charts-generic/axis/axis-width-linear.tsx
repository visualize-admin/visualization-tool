import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { ScatterplotState } from "../scatterplot/scatterplot-state";

export const AxisWidthLinear = () => {
  const { xScale, bounds, xAxisLabel } = useChartState() as ScatterplotState;

  const { chartWidth, chartHeight, margins } = bounds;

  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();

  const ref = useRef<SVGGElement>(null);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const tickValues = xScale.ticks(4);
    if (!tickValues.includes(xScale.domain()[1])) {
      tickValues.splice(-1, 1);
      tickValues.push(xScale.domain()[1]);
    }
    g.call(
      axisBottom(xScale)
        .tickValues(tickValues)
        .tickSize(-chartHeight)
    );
    g.select(".domain").remove();
    g.selectAll(".tick line")
      .attr("stroke", gridColor)
      .attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", 0)
      .attr("dy", labelFontSize)
      .attr("text-anchor", "middle");
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g transform={`translate(${margins.left}, ${margins.top})`}>
        <text
          x={chartWidth}
          y={chartHeight + margins.bottom}
          dy={-labelFontSize}
          fontSize={labelFontSize}
          textAnchor="end"
        >
          {xAxisLabel}
        </text>
      </g>
      <g
        ref={ref}
        transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
      ></g>
    </>
  );
};
