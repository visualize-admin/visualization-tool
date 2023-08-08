import { axisBottom, select, Selection } from "d3";
import { useEffect, useRef } from "react";

import { ColumnsState } from "@/charts/column/columns-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useChartTheme } from "@/charts/shared/use-chart-theme";
import { useTimeFormatUnit } from "@/formatters";
import { useTransitionStore } from "@/stores/transition";

export const AxisWidthBand = () => {
  const ref = useRef<SVGGElement>(null);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { xScale, yScale, bounds, xTimeUnit, getXLabel } =
    useChartState() as ColumnsState;

  const formatDate = useTimeFormatUnit();

  const { chartHeight, margins } = bounds;

  const { labelColor, gridColor, labelFontSize, fontFamily, domainColor } =
    useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    const rotation = true;
    const hasNegativeValues = yScale.domain()[0] < 0;
    const fontSize =
      xScale.bandwidth() > labelFontSize ? labelFontSize : xScale.bandwidth();

    const axis = axisBottom(xScale)
      .tickSizeOuter(0)
      .tickSizeInner(hasNegativeValues ? -chartHeight : 6)
      .tickPadding(rotation ? -10 : 0);

    if (xTimeUnit) {
      axis.tickFormat((d) => formatDate(d, xTimeUnit));
    } else {
      axis.tickFormat((d) => getXLabel(d));
    }

    g.selectAll<SVGGElement, null>(".content")
      .data([null])
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("class", "content")
            .attr("data-testid", "axis-width-band")
            .attr(
              "transform",
              `translate(${margins.left}, ${chartHeight + margins.top})`
            )
            .call(axis),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(transitionDuration)
              .attr(
                "transform",
                `translate(${margins.left}, ${chartHeight + margins.top})`
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
      .attr("transform", rotation ? "rotate(90)" : "rotate(0)")
      .attr("x", rotation ? fontSize : 0)
      .attr("font-size", fontSize)
      .attr("font-family", fontFamily)
      .attr("fill", labelColor)
      .attr("text-anchor", rotation ? "start" : "unset");
  };

  useEffect(() => {
    if (ref.current) {
      select<SVGGElement, unknown>(ref.current).call(mkAxis);
    }
  });

  return <g ref={ref} />;
};

export const AxisWidthBandDomain = () => {
  const ref = useRef<SVGGElement>(null);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { xScale, yScale, bounds } = useChartState() as ColumnsState;
  const { chartHeight, margins } = bounds;
  const { domainColor } = useChartTheme();

  const mkAxisDomain = (
    g: Selection<SVGGElement, unknown, null, undefined>
  ) => {
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
            .call((g) =>
              g
                .transition()
                .duration(transitionDuration)
                .call(axisBottom(xScale).tickSizeOuter(0))
            ),
        (update) =>
          update.call((g) =>
            g
              .transition()
              .duration(transitionDuration)
              .attr(
                "transform",
                `translate(${margins.left}, ${chartHeight + margins.top})`
              )
              .call(axisBottom(xScale).tickSizeOuter(0))
          ),
        (exit) => exit.remove()
      );

    g.selectAll(".tick line").remove();
    g.selectAll(".tick text").remove();
    g.select(".domain")
      .attr("transform", `translate(0, -${bounds.chartHeight - yScale(0)})`)
      .attr("stroke", domainColor);
  };

  useEffect(() => {
    const g = select(ref.current);
    mkAxisDomain(g as Selection<SVGGElement, unknown, null, undefined>);
  });

  return <g ref={ref} />;
};
