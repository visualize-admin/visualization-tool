import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useChartTheme } from "../use-chart-theme";
import { useChartState } from "../use-chart-state";
import { LinesState } from "../lines/lines-state";
import { AreasState } from "../areas/areas-state";
import { formatDateAuto } from "../../../domain/helpers";
import { estimateTextWidth } from "../../../lib/estimate-text-width";
import { max } from "d3-array";

export const AxisTime = () => {
  const ref = useRef<SVGGElement>(null);

  const { xScale, yScale, bounds, xUniqueValues } = useChartState() as
    | LinesState
    | AreasState;

  const {
    labelColor,
    gridColor,
    domainColor,
    labelFontSize,
    fontFamily,
  } = useChartTheme();

  const hasNegativeValues = yScale.domain()[0] < 0;

  const labelLengths = xUniqueValues.map((v) =>
    estimateTextWidth(formatDateAuto(v))
  );
  const maxLabelLength = max(labelLengths, (d) => d) || 70;

  // This could be useful: use data points as tick values,
  // but it does not solve the problem of overlapping.
  // const tickValues =
  //   bounds.chartWidth / (maxLabelLength + 20) > xUniqueValues.length
  //     ? xUniqueValues
  //     : null;
  const ticks = Math.min(
    xUniqueValues.length,
    bounds.chartWidth / (maxLabelLength + 20)
  );

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(xScale)
        .ticks(ticks)
        .tickFormat((x) => formatDateAuto(x as Date))
      // .tickValues(tickValues as $FixMe)
    );
    g.select(".domain").remove();
    g.selectAll(".tick line").attr(
      "stroke",
      hasNegativeValues ? gridColor : domainColor
    );
    g.selectAll(".tick text")
      .attr("font-size", labelFontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${bounds.chartHeight +
        bounds.margins.top})`}
    />
  );
};

export const AxisTimeDomain = () => {
  const ref = useRef<SVGGElement>(null);

  const { xScale, yScale, bounds } = useChartState() as LinesState | AreasState;

  const { domainColor } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(axisBottom(xScale).tickSizeOuter(0));
    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
    g.select(".domain")
      .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
      .attr("stroke", domainColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxis(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return (
    <g
      ref={ref}
      transform={`translate(${bounds.margins.left}, ${bounds.chartHeight +
        bounds.margins.top})`}
    />
  );
};
