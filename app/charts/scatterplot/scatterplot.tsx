import { schemeCategory10 } from "d3-scale-chromatic";
import React from "react";

import {
  RenderDatum,
  renderCircles,
} from "@/charts/scatterplot/rendering-utils";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

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
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const renderData: RenderDatum[] = React.useMemo(() => {
    return chartData.map((d) => {
      return {
        key: getRenderingKey(d),
        cx: xScale(getX(d) ?? NaN),
        cy: yScale(getY(d) ?? NaN),
        color: hasSegment ? colors(getSegment(d)) : schemeCategory10[0],
      };
    });
  }, [
    chartData,
    colors,
    getSegment,
    getX,
    getY,
    hasSegment,
    xScale,
    yScale,
    getRenderingKey,
  ]);

  React.useEffect(() => {
    if (ref.current && renderData) {
      renderContainer(ref.current, {
        id: "scatterplot",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderCircles(g, renderData, opts),
      });
    }
  }, [
    enableTransition,
    margins.left,
    margins.top,
    renderData,
    transitionDuration,
  ]);

  return <g ref={ref} />;
};
