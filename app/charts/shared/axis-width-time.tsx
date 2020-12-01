import { axisBottom } from "d3";
import { select, Selection } from "d3";

import { useEffect, useRef } from "react";
import { useFormatShortDateAuto } from "../../configurator/components/ui-helpers";
import { AreasState } from "../area/areas-state";
import { LinesState } from "../line/lines-state";
import { useChartState } from "./use-chart-state";
import { useChartTheme } from "./use-chart-theme";

// Approximate the longest date format we're using for
// Roughly equivalent to estimateTextWidth("99.99.9999", 12);
const MAX_DATE_LABEL_LENGHT = 70;

export const AxisTime = () => {
  const ref = useRef<SVGGElement>(null);
  const formatDateAuto = useFormatShortDateAuto();

  const { xScale, yScale, bounds } = useChartState() as LinesState | AreasState;

  const {
    labelColor,
    gridColor,
    domainColor,
    labelFontSize,
    fontFamily,
  } = useChartTheme();

  const hasNegativeValues = yScale.domain()[0] < 0;

  // This could be useful: use data points as tick values,
  // but it does not solve the problem of overlapping.
  // const tickValues =
  //   bounds.chartWidth / (MAX_DATE_LABEL_LENGHT + 20) > xUniqueValues.length
  //     ? xUniqueValues
  //     : null;
  const ticks = bounds.chartWidth / (MAX_DATE_LABEL_LENGHT + 20);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(xScale)
        .ticks(ticks)
        .tickFormat((x) => formatDateAuto(x as Date))
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
      transform={`translate(${bounds.margins.left}, ${
        bounds.chartHeight + bounds.margins.top
      })`}
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
      transform={`translate(${bounds.margins.left}, ${
        bounds.chartHeight + bounds.margins.top
      })`}
    />
  );
};
