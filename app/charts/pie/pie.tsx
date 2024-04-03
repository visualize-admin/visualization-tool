import { arc, PieArcDatum } from "d3-shape";
import React from "react";

import { PieState } from "@/charts/pie/pie-state";
import { RenderDatum, renderPies } from "@/charts/pie/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";
import { useTransitionStore } from "@/stores/transition";
import useEvent from "@/utils/use-event";

export const Pie = () => {
  const { chartData, getPieData, getSegment, colors, bounds, getRenderingKey } =
    useChartState() as PieState;
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const { width, height, chartWidth, chartHeight } = bounds;
  const [, dispatch] = useInteraction();
  const ref = React.useRef<SVGGElement>(null);

  const maxSide = Math.min(chartWidth, chartHeight) / 2;

  const innerRadius = 0;
  const outerRadius = maxSide;

  const xTranslate = width / 2;
  const yTranslate = height / 2;

  const arcs = getPieData(chartData);
  const renderData: RenderDatum[] = React.useMemo(() => {
    return arcs.map((arcDatum) => {
      return {
        key: getRenderingKey(arcDatum.data),
        arcDatum,
        innerRadius,
        color: colors(getSegment(arcDatum.data)),
      };
    });
  }, [arcs, getRenderingKey, colors, getSegment]);

  const arcGenerator = arc<$FixMe>()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

  const handleMouseEnter = useEvent((d: PieArcDatum<Observation>) => {
    dispatch({
      type: "INTERACTION_UPDATE",
      value: {
        interaction: {
          visible: true,
          d: d as unknown as Observation, // FIXME
        },
      },
    });
  });

  const handleMouseLeave = useEvent(() => {
    dispatch({
      type: "INTERACTION_HIDE",
    });
  });

  React.useEffect(() => {
    if (ref.current && renderData) {
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
