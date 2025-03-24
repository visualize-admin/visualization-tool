import { Selection } from "d3-selection";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderDatum = {
  key: string;
  cx: number;
  cy: number;
  color: string;
};

export const renderCircles = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  renderData: RenderDatum[],
  options: RenderOptions
) => {
  const { transition } = options;

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
            maybeTransition(enter, {
              transition,
              s: (g) => g.attr("opacity", 1),
            })
          ),
      (update) =>
        maybeTransition(update, {
          transition,
          s: (g) =>
            g
              .attr("cx", (d) => d.cx)
              .attr("cy", (d) => d.cy)
              .attr("fill", (d) => d.color)
              .attr("opacity", 1),
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("opacity", 0).remove(),
        })
    );
};
