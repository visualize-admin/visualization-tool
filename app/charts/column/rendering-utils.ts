import { Selection } from "d3";

import {
  RenderOptions,
  maybeTransition,
} from "@/charts/shared/rendering-utils";

export type RenderColumnDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

type RenderColumnOptions = RenderOptions & {
  y0: number;
};

export const renderColumns = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderColumnDatum[],
  options: RenderColumnOptions
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

export type RenderWhiskerDatum = {
  key: string;
  x: number;
  y1: number;
  y2: number;
  width: number;
};

export const renderWhiskers = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderWhiskerDatum[],
  options: RenderOptions
) => {
  const { transition } = options;

  g.selectAll<SVGGElement, RenderWhiskerDatum>("g")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("opacity", 0)
          .call((g) =>
            g
              .append("rect")
              .attr("class", "top")
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y2)
              .attr("width", (d) => d.width)
              .attr("height", 2)
              .attr("fill", "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "middle")
              .attr("x", (d) => d.x + d.width / 2 - 1)
              .attr("y", (d) => d.y2)
              .attr("width", 2)
              .attr("height", (d) => d.y1 - d.y2)
              .attr("fill", "black")
              .attr("stroke", "none")
          )
          .call((g) =>
            g
              .append("rect")
              .attr("class", "bottom")
              .attr("x", (d) => d.x)
              .attr("y", (d) => d.y1)
              .attr("width", (d) => d.width)
              .attr("height", 2)
              .attr("fill", "black")
              .attr("stroke", "none")
          )
          .call((enter) =>
            maybeTransition(enter, {
              s: (g) => g.attr("opacity", 1),
              transition,
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("opacity", 1)
              .call((g) =>
                g
                  .select(".top")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y2)
                  .attr("width", (d) => d.width)
              )
              .call((g) =>
                g
                  .select(".middle")
                  .attr("x", (d) => d.x + d.width / 2 - 1)
                  .attr("y", (d) => d.y2)
                  .attr("height", (d) => d.y1 - d.y2)
              )
              .call((g) =>
                g
                  .select(".bottom")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y1)
                  .attr("width", (d) => d.width)
              ),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("opacity", 0).remove(),
        })
    );
};
