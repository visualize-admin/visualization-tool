import { useEffect, useMemo, useRef } from "react";

import {
  renderCircles,
  RenderDatum,
} from "@/charts/scatterplot/rendering-utils";
import { ScatterplotState } from "@/charts/scatterplot/scatterplot-state";
import { useGetAnnotationRenderState } from "@/charts/shared/annotation-utils";
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
    segmentDimension,
    getSegment,
    colors,
    getRenderingKey,
  } = useChartState() as ScatterplotState;
  const { margins } = bounds;
  const ref = useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const getAnnotationRenderState = useGetAnnotationRenderState();
  const renderData = useMemo(() => {
    return chartData.map((d) => {
      const segment = getSegment(d);
      const { focused } = getAnnotationRenderState(d, {
        axisComponentId: segmentDimension?.id ?? "",
        axisValue: segment,
      });

      return {
        key: getRenderingKey(d),
        cx: xScale(getX(d) ?? NaN),
        cy: yScale(getY(d) ?? NaN),
        color: colors(segment),
        focused,
      } satisfies RenderDatum;
    });
  }, [
    chartData,
    getSegment,
    getAnnotationRenderState,
    segmentDimension?.id,
    getRenderingKey,
    xScale,
    getX,
    yScale,
    getY,
    colors,
  ]);

  useEffect(() => {
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
