import { arc, PieArcDatum, select } from "d3";
import React from "react";

import { PieState } from "@/charts/pie/pie-state";
import { useChartState } from "@/charts/shared/use-chart-state";
import { useInteraction } from "@/charts/shared/use-interaction";
import { Observation } from "@/domain/data";
import useEvent from "@/utils/use-event";

import { RenderDatum, renderPie } from "./rendering-utils";

export const Pie = () => {
  const { chartData, getPieData, getSegment, colors, bounds, getRenderingKey } =
    useChartState() as PieState;
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
    if (ref.current) {
      select(ref.current).call(
        renderPie,
        renderData,
        arcGenerator,
        handleMouseEnter,
        handleMouseLeave
      );
    }
  }, [renderData, arcGenerator, handleMouseEnter, handleMouseLeave]);

  return <g ref={ref} transform={`translate(${xTranslate}, ${yTranslate})`} />;
};
