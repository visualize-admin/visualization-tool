import { interpolate } from "d3-interpolate";
import { select } from "d3-selection";
import { Arc, PieArcDatum } from "d3-shape";
import { Transition } from "d3-transition";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";
import { Observation } from "@/domain/data";

import type { BaseType, Selection } from "d3-selection";

export type RenderDatum = {
  key: string;
  arcDatum: PieArcDatum<Observation>;
  color: string;
};

type RenderPieOptions = RenderOptions & {
  arcGenerator: Arc<any, any>;
  handleMouseEnter: (d: PieArcDatum<Observation>) => void;
  handleMouseLeave: () => void;
};

export const renderPies = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  renderData: RenderDatum[],
  options: RenderPieOptions
) => {
  const { arcGenerator, transition, handleMouseEnter, handleMouseLeave } =
    options;

  g.selectAll<SVGPathElement, RenderDatum>("path")
    .data(renderData, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("data-index", (_, i) => i)
          .attr("fill", (d) => d.color)
          .attr("stroke", "black")
          .attr("stroke-width", 0)
          .on("mouseenter", function (_, d) {
            handleMouseEnter(d.arcDatum);
            select<SVGPathElement, RenderDatum>(this).call(
              (s: Selection<SVGPathElement, RenderDatum, BaseType, unknown>) =>
                maybeTransition(s, {
                  transition,
                  s: (g) => g.attr("stroke-width", 1),
                  t: (g) => g.attr("stroke-width", 1),
                })
            );
          })
          .on("mouseleave", function () {
            handleMouseLeave();
            select<SVGPathElement, RenderDatum>(this).call(
              (s: Selection<SVGPathElement, RenderDatum, BaseType, unknown>) =>
                maybeTransition(s, {
                  transition,
                  s: (g) => g.attr("stroke-width", 0),
                  t: (g) => g.attr("stroke-width", 0),
                })
            );
          })
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
  arcGenerator: Arc<any, any>
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
