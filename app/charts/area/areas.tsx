import { area, select, Selection } from "d3";
import React from "react";

import { AreasState } from "@/charts/area/areas-state";
import { renderArea, RenderAreaDatum } from "@/charts/area/rendering-utils";
import { useChartState } from "@/charts/shared/chart-state";
import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";

export const Areas = () => {
  const { bounds, getX, xScale, yScale, colors, series } =
    useChartState() as AreasState;
  const { margins } = bounds;
  const ref = React.useRef<SVGGElement>(null);
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
    const renderAreas = (
      g: Selection<SVGGElement, null, SVGGElement, unknown>
    ) => {
      g.selectAll<SVGRectElement, RenderAreaDatum>("path")
        .data(renderData, (d) => d.key)
        .call(renderArea);
    };

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
              .call(renderAreas),
          (update) =>
            update
              .call((g) =>
                g
                  .transition()
                  .duration(TRANSITION_DURATION)
                  .attr(
                    "transform",
                    `translate(${margins.left} ${margins.top})`
                  )
              )
              .call(renderAreas),
          (exit) => exit.remove()
        );
    }
  }, [renderData, yScale, margins.left, margins.top]);

  return <g ref={ref} />;
};
