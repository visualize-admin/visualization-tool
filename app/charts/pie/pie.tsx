import { arc, PieArcDatum } from "d3-shape";
import { useEffect, useMemo, useRef } from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum, renderPies } from "@/charts/pie/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";
import useEvent from "@/utils/use-event";

export const Pie = () => {
  const {
    bounds: { width, height, chartWidth, chartHeight },
    chartData,
    getPieData,
    getSegment,
    colors,
    getRenderingKey,
  } = useChartState() as PieState;
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const [, dispatch] = useInteraction();
  const ref = useRef<SVGGElement>(null);

  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = maxSide;

  const xTranslate = width / 2;
  const yTranslate = height / 2;

  const renderData: RenderDatum[] = useMemo(() => {
    const arcs = getPieData(chartData);

    return arcs.map((arcDatum) => {
      return {
        key: getRenderingKey(arcDatum.data),
        arcDatum,
        innerRadius,
        color: colors(getSegment(arcDatum.data)),
      };
    });
  }, [getPieData, chartData, getRenderingKey, colors, getSegment]);

  const arcGenerator = arc<$FixMe>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const handleMouseEnter = useEvent((d: PieArcDatum<Observation>) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        interaction: {
          visible: true,
          d: d as unknown as Observation,
        },
      },
    });
  });

  const handleMouseLeave = useEvent(() => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  });

  useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "pies",
        transform: `translate(${xTranslate} ${yTranslate})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) =>
          renderPies(g, renderData, {
            ...opts,
            arcGenerator,
            handleMouseEnter,
            handleMouseLeave,
          }),
      });
    }
  }, [
    arcGenerator,
    enableTransition,
    handleMouseEnter,
    handleMouseLeave,
    renderData,
    transitionDuration,
    xTranslate,
    yTranslate,
  ]);

  return <g ref={ref} />;
};
