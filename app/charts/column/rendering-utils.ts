import { Selection } from "d3-selection";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderColumnDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export const renderColumns = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderColumnDatum[],
  options: RenderOptions & { y0: number }
) => {
  const { transition, y0 } = options;

  g.selectAll<SVGRectElement, RenderColumnDatum>("rect")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("data-index", (_, i) => i)
          .attr("x", (d) => d.x)
          .attr("y", y0)
          .attr("width", (d) => d.width)
          .attr("height", 0)
          .attr("fill", (d) => d.color)
          .call((enter) =>
            maybeTransition(enter, {
              transition,
              s: (g) => g.attr("y", (d) => d.y).attr("height", (d) => d.height),
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y)
              .attr("width", (d) => d.width)
              .attr("height", (d) => d.height)
              .attr("fill", (d) => d.color),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("y", y0).attr("height", 0).remove(),
        })
    );
};
