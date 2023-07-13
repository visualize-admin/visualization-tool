import { Selection } from "d3";

import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";

export type RenderDatum = {
  key: string;
  cx: number;
  cy: number;
  color: string;
};

export const renderCircles = (
  g: Selection<SVGGElement, unknown, null, unknown>,
  renderData: RenderDatum[]
) => {
  g.selectAll<SVGCircleElement, RenderDatum>("circle")
    .data(renderData, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("circle")
          .attr("data-index", (_, i) => i)
          .attr("cx", (d) => d.cx)
          .attr("cy", (d) => d.cy)
          .attr("r", 4)
          .attr("stroke", "none")
          .attr("fill", (d) => d.color)
          .attr("opacity", 0)
          .call((enter) =>
            enter.transition().duration(TRANSITION_DURATION).attr("opacity", 1)
          ),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .attr("fill", (d) => d.color)
            .attr("opacity", 1)
        ),
      (exit) =>
        exit.call((exit) =>
          exit
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("opacity", 0)
            .remove()
        )
    );
};
