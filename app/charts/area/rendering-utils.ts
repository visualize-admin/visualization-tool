import { interpolatePath } from "d3-interpolate-path";
import { select, Selection } from "d3-selection";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderAreaDatum = {
  key: string;
  d: string;
  dEmpty: string;
  color: string;
};

export const renderAreas = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderAreaDatum[],
  options: RenderOptions
) => {
  const { transition } = options;

  g.selectAll<SVGPathElement, RenderAreaDatum>("path")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("path")
          .attr("d", (d) => d.dEmpty)
          .attr("fill", (d) => d.color)
          .call((enter) =>
            maybeTransition(enter, {
              transition,
              s: (g) => g.attr("d", (d) => d.d),
              t: (g) => g.attrTween("d", (d) => interpolatePath(d.dEmpty, d.d)),
            })
          ),
      (update) =>
        maybeTransition(update, {
          transition,
          s: (g) => g.attr("d", (d) => d.d).attr("fill", (d) => d.color),
          t: (g) =>
            g
              .attrTween("d", function (d) {
                return interpolatePath(select(this).attr("d"), d.d);
              })
              .attr("fill", (d) => d.color),
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.attr("d", (d) => d.dEmpty).remove(),
          t: (g) =>
            g.attrTween("d", (d) => interpolatePath(d.d, d.dEmpty)).remove(),
        })
    );
};
