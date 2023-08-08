import { Selection, select } from "d3";
import { interpolatePath } from "d3-interpolate-path";

export type RenderAreaDatum = {
  key: string;
  d: string;
  dEmpty: string;
  color: string;
};

export const renderArea = (
  g: Selection<SVGRectElement, RenderAreaDatum, SVGGElement, unknown>,
  transitionDuration: number
) => {
  g.join(
    (enter) =>
      enter
        .append("path")
        .attr("d", (d) => d.dEmpty)
        .attr("fill", (d) => d.color)
        .call((enter) =>
          enter
            .transition()
            .duration(transitionDuration)
            .attrTween("d", (d) => interpolatePath(d.dEmpty, d.d))
        ),
    (update) =>
      update.call((update) =>
        update
          .transition()
          .duration(transitionDuration)
          .attrTween("d", function (d) {
            return interpolatePath(select(this).attr("d"), d.d);
          })
          .attr("fill", (d) => d.color)
      ),
    (exit) =>
      exit.call((exit) =>
        exit
          .transition()
          .duration(transitionDuration)
          .attrTween("d", (d) => interpolatePath(d.d, d.dEmpty))
          .remove()
      )
  );
};
