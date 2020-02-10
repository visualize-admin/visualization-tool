import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useChartState } from "../use-chart-state";
import { useChartTheme } from "../use-chart-theme";
import { ColumnsState } from "../columns/columns-state";

export const AxisWidthBand = () => {
  const ref = useRef<SVGGElement>(null);
  const { xScale, bounds } = useChartState() as ColumnsState;

  const { chartHeight, margins } = bounds;

  const {
    labelColor,
    labelFontSize,
    fontFamily,
    domainColor
  } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const rotation = xScale.domain().length > 6;

    g.call(axisBottom(xScale).tickSizeOuter(0));
    g.select(".domain").attr("stroke", domainColor);
    g.selectAll(".tick line").attr("stroke", domainColor);
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("y", rotation ? 0 : labelFontSize + 6)
      .attr("x", rotation ? labelFontSize : 0)
      .attr("dy", rotation ? ".35em" : 0)
      .attr("transform", rotation ? "rotate(90)" : "rotate(0)")
      .attr("text-anchor", rotation ? "start" : "unset");
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${margins.left}, ${chartHeight + margins.top})`}
    ></g>
  );
};
