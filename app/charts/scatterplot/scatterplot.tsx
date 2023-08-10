import React from "react";

import {
  RenderDatum,
  renderCircles,
} from "@/charts/scatterplot/rendering-utils";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
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
  const enableTransition = useTransitionStore((state) => state.enable);
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
