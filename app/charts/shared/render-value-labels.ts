import { BaseType, Selection } from "d3-selection";

import {
  maybeTransition,
  RenderOptions,
} from "@/charts/shared/rendering-utils";

export type RenderTotalValueLabelDatum = {
  key: string;
  x: number;
  y: number;
  valueLabel: string;
};

export const renderTotalValueLabels = (
  g: Selection<SVGGElement, null, SVGGElement, unknown>,
  data: RenderTotalValueLabelDatum[],
  options: RenderOptions & {
    rotate: boolean;
    textAnchor?: "start" | "middle" | "end";
    dx?: number;
    dy?: number;
    fontSize: number;
    fontFamily: string;
  }
) => {
  const {
    transition,
    rotate,
    textAnchor: _textAnchor,
    dx = 0,
    dy = -8,
    fontFamily,
    fontSize,
  } = options;
  const textAnchor = _textAnchor ?? getValueLabelTextAnchor(rotate);

  g.selectAll<SVGTextElement, RenderTotalValueLabelDatum>("text")
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
          .attr("stroke-width", 8)
          .style("transform", (d) =>
            getValueLabelTransform(d, {
              rotate,
              labelHeight: fontSize,
              dx,
              dy,
            })
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
                getValueLabelTransform(d, {
                  rotate,
                  labelHeight: fontSize,
                  dx,
                  dy,
                })
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
  d: RenderTotalValueLabelDatum,
  {
    rotate,
    labelHeight,
    dx,
    dy,
  }: {
    rotate: boolean;
    labelHeight: number;
    dx: number;
    dy: number;
  }
) => {
  if (rotate) {
    return `translate(${d.x + labelHeight}px, ${d.y - labelHeight}px) rotate(-90deg)`;
  }

  return `translate(${d.x + dx}px, ${d.y + dy}px) rotate(0deg)`;
};

const getValueLabelTextAnchor = (rotate: boolean) => {
  return rotate ? "start" : "middle";
};

export const setSegmentValueLabelStyles = <
  T extends { valueLabel?: string; valueLabelColor?: string },
>(
  g: Selection<BaseType, T, SVGGElement, null>
) => {
  return g
    .style("overflow", "hidden")
    .style("padding-left", "4px")
    .style("font-size", "12px")
    .style("white-space", "nowrap")
    .style("text-overflow", "ellipsis");
};
