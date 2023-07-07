import { select } from "d3";
import React from "react";

import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useTheme } from "@/themes";

import { RenderDatum, renderCircles } from "./rendering-utils";

export const Scatterplot = () => {
  const {
    chartData,
    bounds,
    getX,
    xScale,
    getY,
    yScale,
    hasSegment,
    getSegment,
    colors,
  } = useChartState() as ScatterplotState;
  const theme = useTheme();
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);

  const renderData: RenderDatum[] = React.useMemo(() => {
    return chartData.map((d, i) => {
      return {
        key: i.toString(),
        cx: xScale(getX(d) ?? NaN),
        cy: yScale(getY(d) ?? NaN),
        color: hasSegment ? colors(getSegment(d)) : theme.palette.primary.main,
      };
    });
  }, [
    chartData,
    colors,
    getSegment,
    getX,
    getY,
    hasSegment,
    theme.palette.primary.main,
    xScale,
    yScale,
  ]);

  React.useEffect(() => {
    if (ref.current) {
      select<SVGGElement, null>(ref.current).call(renderCircles, renderData);
    }
  }, [renderData]);

  return (
    <g ref={ref} transform={`translate(${margins.left} ${margins.top})`} />
  );
};
