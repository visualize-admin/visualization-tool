import { Selection } from "d3";

import { TRANSITION_DURATION } from "@/charts/shared/rendering-utils";

export type RenderColumnDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export const renderColumn = (
  g: Selection<SVGRectElement, RenderColumnDatum, SVGGElement, unknown>,
  y0: number
) => {
  g.join(
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
          enter
            .transition()
            .duration(TRANSITION_DURATION)
            .attr("y", (d) => d.y)
            .attr("height", (d) => d.height)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(TRANSITION_DURATION)
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .attr("width", (d) => d.width)
          .attr("height", (d) => d.height)
          .attr("fill", (d) => d.color)
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition()
          .duration(TRANSITION_DURATION)
          .attr("y", y0)
          .attr("height", 0)
          .remove()
      )
  );
};

export type RenderWhiskerDatum = {
  key: string;
  x: number;
  y1: number;
  y2: number;
  width: number;
};

export const renderWhisker = (
  g: Selection<SVGGElement, RenderWhiskerDatum, SVGGElement, unknown>
) => {
  g.join(
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
        .call((g) =>
          g.transition().duration(TRANSITION_DURATION).attr("opacity", 1)
        ),
    (update) =>
      update.call((g) =>
        g
          .transition()
          .duration(TRANSITION_DURATION)
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
          )
      ),
    (exit) =>
      exit.call((g) =>
        g.transition().duration(TRANSITION_DURATION).attr("opacity", 0).remove()
      )
  );
};
