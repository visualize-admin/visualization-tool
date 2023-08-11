import { select } from "d3";
import React from "react";

import {
  RenderDatum,
  renderCircles,
} from "@/charts/scatterplot/rendering-utils";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { useTransitionStore } from "@/stores/transition";
import { useTheme } from "@/themes";

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
    getRenderingKey,
  } = useChartState() as ScatterplotState;
  const theme = useTheme();
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
  const transitionDuration = useTransitionStore((state) => state.duration);

  const renderData: RenderDatum[] = React.useMemo(() => {
    return chartData.map((d) => {
      return {
        key: getRenderingKey(d),
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
    getRenderingKey,
  ]);

  React.useEffect(() => {
    if (ref.current) {
      select(ref.current)
        .selectAll<SVGGElement, null>(".content")
        .data([null])
        .join(
          (enter) =>
            enter
              .append("g")
              .attr("class", "content")
              .attr("transform", `translate(${margins.left} ${margins.top})`)
              .call(renderCircles, renderData),
          (update) =>
            update
              .call((g) =>
                g
                  .transition()
                  .duration(transitionDuration)
                  .attr(
                    "transform",
                    `translate(${margins.left} ${margins.top})`
                  )
              )
              .call(renderCircles, renderData, transitionDuration),
          (exit) => exit.remove()
        )
        .call(renderCircles, renderData);
    }
  }, [renderData, margins.left, margins.top, transitionDuration]);

  return <g ref={ref} />;
};
