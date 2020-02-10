import { axisLeft } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { ColumnsState } from "../columns/columns-state";
import { LinesState } from "../lines/lines-state";
import { AreasState } from "../areas/areas-state";

export const AxisHeightLinear = () => {
  const ref = useRef<SVGGElement>(null);

  const { yScale, yAxisLabel, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;

  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const tickValues = yScale.ticks(4);
    if (!tickValues.includes(yScale.domain()[1])) {
      tickValues.push(yScale.domain()[1]);
    }
    g.call(
      axisLeft(yScale)
        .tickValues(tickValues)
        .tickSize(-bounds.chartWidth)
    );
    g.select(".domain").remove();
    g.selectAll(".tick line")
      .attr("stroke", gridColor)
      .attr("stroke-width", 1);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("x", -6)
      .attr("dy", 3)
      .attr("text-anchor", "end");
  };
  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <>
      <g>
        <text x={0} y={0} dy={labelFontSize} fontSize={labelFontSize}>
          {yAxisLabel}
        </text>
      </g>
      <g
        ref={ref}
        transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
      ></g>
    </>
  );
};
