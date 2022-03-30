import { axisLeft } from "d3";
import { select, Selection } from "d3";

import { useEffect, useRef } from "react";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { ColumnsState } from "@/charts/column/columns-state";
import { LinesState } from "@/charts/line/lines-state";
import { AreasState } from "@/charts/area/areas-state";
import { useFormatNumber } from "@/configurator/components/ui-helpers";

export const TICK_MIN_HEIGHT = 50;

export const getTickNumber = (height: number) => {
  return Math.min(height / TICK_MIN_HEIGHT, 4);
};

export const AxisHeightLinear = () => {
  const ref = useRef<SVGGElement>(null);
  const formatNumber = useFormatNumber();

  const { yScale, yAxisLabel, bounds } = useChartState() as
    | ColumnsState
    | LinesState
    | AreasState;

  const ticks = getTickNumber(bounds.chartHeight);

  const { labelColor, labelFontSize, gridColor, fontFamily } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisLeft(yScale)
        .ticks(ticks)
        .tickSizeInner(-bounds.chartWidth)
        .tickFormat(formatNumber)
    );

    g.select(".domain").remove();

    g.selectAll(".tick line").attr("stroke", gridColor).attr("stroke-width", 1);
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
      />
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
    g.call(axisLeft(yScale).tickSizeOuter(0));

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

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${bounds.margins.top})`}
    />
  );
};
