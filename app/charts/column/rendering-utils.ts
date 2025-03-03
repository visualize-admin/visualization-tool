import { Selection } from "d3-selection";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderColumnDatum = {
  key: string;
  x: number;
  y: number;
  value: number;
  width: number;
  height: number;
  color: string;
};

export const renderColumns = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderColumnDatum[],
  options: RenderOptions & { y0: number }
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

export type RenderColumnValueDatum = {
  key: string;
  x: number;
  y: number;
  valueLabel: string;
};

export const renderColumnValues = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderColumnValueDatum[],
  options: RenderOptions & {
    rotate: boolean;
    fontSize: number;
    fontFamily: string;
  }
) => {
  const { transition, rotate, fontFamily, fontSize } = options;
  const textAnchor = getColumnValueTextAnchor(rotate);

  g.selectAll<SVGTextElement, RenderColumnValueDatum>("text")
    .data(data, (d) => d.key)
    .join(
      (enter) =>
        enter
          .append("text")
          .attr("font-size", fontSize)
          .attr("font-family", fontFamily)
          .attr("text-anchor", textAnchor)
          .attr("paint-order", "stroke")
          .attr("stroke", "white")
          .attr("stroke-width", 3)
          .style("transform", (d) =>
            getColumnValueTransform(d, { rotate, labelHeight: fontSize })
          )
          .style("transform-origin", "0% 50%")
          .style("line-height", 1)
          .style("opacity", 0)
          .text((d) => d.valueLabel)
          .call((enter) =>
            maybeTransition(enter, {
              transition,
              s: (g) => g.style("opacity", 1),
            })
          ),
      (update) =>
        maybeTransition(update, {
          s: (g) =>
            g
              .attr("text-anchor", textAnchor)
              .style("transform", (d) =>
                getColumnValueTransform(d, { rotate, labelHeight: fontSize })
              )
              .style("opacity", 1)
              .text((d) => d.valueLabel),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) =>
            g
              .style("transform", (d) =>
                getColumnValueTransform(d, { rotate, labelHeight: fontSize })
              )
              .style("opacity", 0)
              .remove(),
        })
    );
};

const getColumnValueTransform = (
  d: RenderColumnValueDatum,
  { rotate, labelHeight }: { rotate: boolean; labelHeight: number }
) => {
  if (rotate) {
    return `translate(${d.x + labelHeight}px, ${d.y - labelHeight}px) rotate(-90deg)`;
  }

  return `translate(${d.x}px, ${d.y - 8}px) rotate(0deg)`;
};

const getColumnValueTextAnchor = (rotate: boolean) => {
  return rotate ? "start" : "middle";
};
