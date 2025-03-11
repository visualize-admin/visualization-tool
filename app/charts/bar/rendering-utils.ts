import { select, Selection } from "d3-selection";

import { setSegmentValueLabelStyles } from "@/charts/shared/render-value-labels";
import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderBarDatum = {
  key: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  valueLabel?: string;
  valueLabelColor?: string;
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

  g.selectAll<SVGGElement, RenderBarDatum>("g.bar")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("g")
          .attr("class", "bar")
          .call((g) =>
            g
              .append("rect")
              .attr("data-index", (_, i) => i)
              .attr("y", (d) => d.y)
              .attr("x", x0)
              .attr("width", 0)
              .attr("height", (d) => d.height)
              .attr("fill", (d) => d.color)
              .call((enter) =>
                maybeTransition(enter, {
                  transition,
                  s: (g) =>
                    g.attr("x", (d) => d.x).attr("width", (d) => d.width),
                })
              )
          )
          .call((g) =>
            g
              .append("foreignObject")
              .attr("x", x0)
              .attr("y", (d) => d.y)
              .attr("width", (d) => d.width)
              .attr("height", (d) => d.height)
              .call((g) =>
                maybeTransition(g, {
                  transition,
                  s: (g) => g.attr("x", (d) => d.x),
                })
              )
              .append("xhtml:div")
              .style("display", "flex")
              .style("align-items", "center")
              .style("width", "100%")
              .style("height", "100%")
              .append("xhtml:p")
              .call(setSegmentValueLabelStyles)
              .style("color", function (d) {
                return d.valueLabelColor ?? select(this).style("color");
              })
              .text((d) => d.valueLabel ?? "")
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .call((g) =>
                g
                  .select("rect")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y)
                  .attr("width", (d) => d.width)
                  .attr("height", (d) => d.height)
                  .attr("fill", (d) => d.color)
              )
              .call((g) =>
                g
                  .select("foreignObject")
                  .attr("x", (d) => d.x)
                  .attr("y", (d) => d.y)
                  .attr("width", (d) => d.width)
                  .attr("height", (d) => d.height)
                  .select("p")
                  .style("color", function (d) {
                    return d.valueLabelColor ?? select(this).style("color");
                  })
                  .text((d) => d.valueLabel ?? "")
              ),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) =>
            g.call((g) =>
              g.selectAll().attr("x", x0).attr("height", 0).remove()
            ),
        })
    );
};
