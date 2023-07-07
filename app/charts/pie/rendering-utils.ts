import { PieArcDatum, Selection, Transition, interpolate } from "d3";

import { Observation } from "@/domain/data";

export type RenderDatum = {
  key: string;
  arcDatum: PieArcDatum<Observation>;
  color: string;
};

export const renderPie = (
  g: Selection<SVGGElement, unknown, null, unknown>,
  renderData: RenderDatum[],
  arcGenerator: d3.Arc<any, any>,
  handleMouseEnter: (d: PieArcDatum<Observation>) => void,
  handleMouseLeave: () => void
) => {
  g.selectAll<SVGPathElement, RenderDatum>("path")
    .data(renderData, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("data-index", (_, i) => i)
          .attr("fill", (d) => d.color)
          .on("mouseenter", (_, d) => handleMouseEnter(d.arcDatum))
          .on("mouseleave", handleMouseLeave)
          .call((enter) => enter.transition().call(animatePath, arcGenerator)),
      (update) =>
        update.call((update) =>
          update
            .transition()
            .attr("fill", (d) => d.color)
            .call(animatePath, arcGenerator)
        ),
      (exit) =>
        exit.call((exit) =>
          exit.transition().call(animatePath, arcGenerator).remove()
        )
    );
};

const animatePath = (
  g: Transition<SVGPathElement, RenderDatum, SVGGElement, unknown>,
  arcGenerator: d3.Arc<any, any>
) => {
  return g.attrTween("d", function (d) {
    const that = this as any;
    // Previous arcDatum.
    const _d = that.__d__ as PieArcDatum<Observation> | undefined;
    const i = interpolate(_d ?? d.arcDatum, d.arcDatum);

    return function (t) {
      that.__d__ = i(t);
      return arcGenerator(that.__d__) as string;
    };
  });
};
