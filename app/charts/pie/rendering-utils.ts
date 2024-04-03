import { interpolate } from "d3-interpolate";
import { Selection } from "d3-selection";
import { PieArcDatum } from "d3-shape";
import { Transition } from "d3-transition";

import {
  RenderOptions,
  maybeTransition,
} from "@/charts/shared/rendering-utils";
import { Observation } from "@/domain/data";

export type RenderDatum = {
  key: string;
  arcDatum: PieArcDatum<Observation>;
  color: string;
};

type RenderPieOptions = RenderOptions & {
  arcGenerator: d3.Arc<any, any>;
  handleMouseEnter: (d: PieArcDatum<Observation>) => void;
  handleMouseLeave: () => void;
};

export const renderPies = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  renderData: RenderDatum[],
  options: RenderPieOptions
) => {
  const { arcGenerator, handleMouseEnter, handleMouseLeave, transition } =
    options;

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
          .call((enter) =>
            maybeTransition(enter, {
              transition,
              s: (g) => g.attr("d", (d) => arcGenerator(d.arcDatum)),
              t: (g) => g.call(animatePath, arcGenerator),
            })
          ),
      (update) =>
        update.call((update) =>
          maybeTransition(update, {
            transition,
            s: (g) =>
              g
                .attr("d", (d) => arcGenerator(d.arcDatum))
                .attr("fill", (d) => d.color),
            t: (g) =>
              g.call(animatePath, arcGenerator).attr("fill", (d) => d.color),
          })
        ),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("d", (d) => arcGenerator(d.arcDatum)).remove(),
          t: (g) => g.call(animatePath, arcGenerator).remove(),
        })
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

    return (t) => {
      that.__d__ = i(t);
      return arcGenerator(that.__d__) as string;
    };
  });
};
