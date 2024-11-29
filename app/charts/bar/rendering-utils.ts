import { Selection } from "d3-selection";

import {
  RenderOptions,
  maybeTransition,
} from "@/charts/shared/rendering-utils";

export type RenderBarDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type RenderBarOptions = RenderOptions & {
  x0: number;
};

export const renderBars = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderBarDatum[],
  options: RenderBarOptions
) => {
  const { transition, x0 } = options;

  g.selectAll<SVGRectElement, RenderBarDatum>("rect")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("rect")
          .attr("data-index", (_, i) => i)
          .attr("y", (d) => d.y)
          .attr("x", x0)
          .attr("width", (d) => d.width)
          .attr("height", 0)
          .attr("fill", (d) => d.color)
          .call((enter) =>
            maybeTransition(enter, {
              transition,
              s: (g) => g.attr("x", (d) => d.x).attr("width", (d) => d.width),
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
          s: (g) => g.attr("x", x0).attr("height", 0).remove(),
        })
    );
};
