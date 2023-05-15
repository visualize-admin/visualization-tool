import { Selection } from "d3";

export type RenderDatum = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
};

export const renderColumn = (
  g: Selection<SVGRectElement, RenderDatum, SVGGElement, unknown>,
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
            .attr("y", (d) => d.y)
            .attr("height", (d) => d.height)
        ),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .attr("x", (d) => d.x)
          .attr("y", (d) => d.y)
          .attr("width", (d) => d.width)
          .attr("height", (d) => d.height)
          .attr("fill", (d) => d.color)
      ),
    (exit) =>
      exit.call((exit) =>
        exit.transition().attr("y", y0).attr("height", 0).remove()
      )
  );
};
