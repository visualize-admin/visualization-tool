import { area } from "d3";
import React from "react";

import { AreasState } from "@/charts/area/areas-state";
import { RenderAreaDatum, renderAreas } from "@/charts/area/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { renderContainer } from "@/charts/shared/rendering-utils";
import { useTransitionStore } from "@/stores/transition";

export const Areas = () => {
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as AreasState;
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
  const enableTransition = useTransitionStore((state) => state.enable);
  const transitionDuration = useTransitionStore((state) => state.duration);
  const areaGenerator = area<$FixMe>()
    .defined((d) => d[0] !== null && d[1] !== null)
    .x((d) => xScale(getX(d.data)))
    .y0((d) => yScale(d[0]))
    .y1((d) => yScale(d[1]));
  const renderData: RenderAreaDatum[] = React.useMemo(() => {
    return series.map((d) => {
      return {
        key: `${d.key}`,
        d: areaGenerator(d) as string,
        dEmpty: areaGenerator(
          d.map((d: [number, number]) => {
            const dNew = { ...d };
            dNew[1] = d[0];

            return dNew;
          })
        ) as string,
        color: colors(d.key),
      };
    });
  }, [series, areaGenerator, colors]);

  React.useEffect(() => {
    if (ref.current) {
      renderContainer(ref.current, {
        id: "areas",
        transform: `translate(${margins.left} ${margins.top})`,
        transition: { enable: enableTransition, duration: transitionDuration },
        render: (g, opts) => renderAreas(g, renderData, opts),
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
