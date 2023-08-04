import { axisBottom, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import { AreasState } from "@/charts/area/areas-state";
import { LinesState } from "@/charts/line/lines-state";
import { useChartState } from "@/charts/shared/chart-state";
import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useFormatShortDateAuto } from "@/formatters";

// Approximate the longest date format we're using for
// Roughly equivalent to estimateTextWidth("99.99.9999", 12);
const MAX_DATE_LABEL_LENGHT = 70;

export const AxisTime = () => {
  const ref = useRef<SVGGElement>(null);
  const formatDateAuto = useFormatShortDateAuto();
  const { xScale, yScale, bounds } = useChartState() as LinesState | AreasState;
  const { labelColor, gridColor, domainColor, labelFontSize, fontFamily } =
    useChartTheme();

  const hasNegativeValues = yScale.domain()[0] < 0;

  // This could be useful: use data points as tick values,
  // but it does not solve the problem of overlapping.
  // const tickValues =
  //   bounds.chartWidth / (MAX_DATE_LABEL_LENGHT + 20) > xUniqueValues.length
  //     ? xUniqueValues
  //     : null;
  const ticks = bounds.chartWidth / (MAX_DATE_LABEL_LENGHT + 20);

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const axis = axisBottom(xScale)
      .ticks(ticks)
      .tickFormat((x) => formatDateAuto(x as Date));

    g.selectAll<SVGGElement, null>(".content")
      .data([null])
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "content")
            .attr(
              "transform",
              `translate(${bounds.margins.left}, ${
                bounds.chartHeight + bounds.margins.top
              })`
            )
            .call(axis),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(TRANSITION_DURATION)
              .attr(
                "transform",
                `translate(${bounds.margins.left}, ${
                  bounds.chartHeight + bounds.margins.top
                })`
              )
              .call(axis)
          ),
        (exit) => exit.remove()
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

  return <g ref={ref} />;
};

export const AxisTimeDomain = () => {
  const ref = useRef<SVGGElement>(null);

  const { xScale, yScale, bounds } = useChartState() as LinesState | AreasState;

  const { domainColor } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
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
              `translate(${bounds.margins.left}, ${
                bounds.chartHeight + bounds.margins.top
              })`
            )
            .call(axis),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(TRANSITION_DURATION)
              .attr(
                "transform",
                `translate(${bounds.margins.left}, ${
                  bounds.chartHeight + bounds.margins.top
                })`
              )
              .call(axis)
          ),
        (exit) => exit.remove()
      );

    g.call(axis);
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

  return <g ref={ref} />;
};
