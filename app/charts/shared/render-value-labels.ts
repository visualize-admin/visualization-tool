import { Selection } from "d3-selection";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderValueLabelDatum = {
  key: string;
  x: number;
  y: number;
  valueLabel: string;
};

export const renderValueLabels = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderValueLabelDatum[],
  options: RenderOptions & {
    rotate: boolean;
    fontSize: number;
    fontFamily: string;
  }
) => {
  const { transition, rotate, fontFamily, fontSize } = options;
  const textAnchor = getValueLabelTextAnchor(rotate);

  g.selectAll<SVGTextElement, RenderValueLabelDatum>("text")
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
            getValueLabelTransform(d, { rotate, labelHeight: fontSize })
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
                getValueLabelTransform(d, { rotate, labelHeight: fontSize })
              )
              .style("opacity", 1)
              .text((d) => d.valueLabel),
          transition,
        }),
      (exit) =>
        maybeTransition(exit, {
          transition,
          s: (g) => g.style("opacity", 0).remove(),
        })
    );
};

const getValueLabelTransform = (
  d: RenderValueLabelDatum,
  { rotate, labelHeight }: { rotate: boolean; labelHeight: number }
) => {
  if (rotate) {
    return `translate(${d.x + labelHeight}px, ${d.y - labelHeight}px) rotate(-90deg)`;
  }

  return `translate(${d.x}px, ${d.y - 8}px) rotate(0deg)`;
};

const getValueLabelTextAnchor = (rotate: boolean) => {
  return rotate ? "start" : "middle";
};
