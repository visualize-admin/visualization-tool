import { axisBottom } from "d3-axis";
import { select, Selection } from "d3-selection";
import * as React from "react";
import { useEffect, useRef } from "react";
import { useChartTheme } from "../use-chart-theme";
import { useChartState } from "../use-chart-state";
import { LinesState } from "../lines/lines-state";
import { AreasState } from "../areas/areas-state";
import { useLocale } from "../../../lib/use-locale";
import { d3TimeFormatLocales } from "../../../locales/locales";
import { timeFormat } from "d3-time-format";

export const AxisTime = () => {
  const ref = useRef<SVGGElement>(null);
  const locale = useLocale();

  const formatLocale = d3TimeFormatLocales[locale];
  const formatYear = (x: Date): string => timeFormat("%Y")(x);

  const { xScale, xUniqueValues, bounds } = useChartState() as
    | LinesState
    | AreasState;

  const { labelColor, labelFontSize, fontFamily } = useChartTheme();

  const mkAxis = (g: Selection<SVGGElement, unknown, null, undefined>) => {
    g.call(
      axisBottom(xScale)
        .ticks(Math.min(xUniqueValues.length, 10))
        .tickFormat(x => formatYear(x as Date))
    );
    g.selectAll(".tick line").remove();
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
