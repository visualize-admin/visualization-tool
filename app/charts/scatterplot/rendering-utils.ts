import { Selection } from "d3";

export type RenderDatum = {
  key: string;
  cx: number;
  cy: number;
  color: string;
};

export const renderCircles = (
  g: Selection<SVGGElement, null, null, unknown>,
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
          .call((enter) => enter.transition().attr("opacity", 1)),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .attr("cx", (d) => d.cx)
            .attr("cy", (d) => d.cy)
            .attr("fill", (d) => d.color)
        ),
      (exit) =>
        exit.call((exit) => exit.transition().attr("opacity", 0).remove())
    );
};
