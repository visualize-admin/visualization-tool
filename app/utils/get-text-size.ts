import { select } from "d3-selection";

export type GetTextSizeOptions = {
  width: number;
  fontSize: number;
  fontWeight: number;
  lineHeight?: number;
  paddingLeft?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
};

export const getTextSize = (
  text: string | number,
  options: GetTextSizeOptions
): DOMRect => {
  const {
    width,
    fontSize,
    fontWeight,
    lineHeight = 1.5,
    paddingLeft = 0,
    paddingTop = 0,
    paddingRight = 0,
    paddingBottom = 0,
  } = options ?? {};

  if (typeof document === "undefined") {
    return {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    } as DOMRect;
  }

  const root = select("body")
    .append("div")
    .attr("aria-hidden", "true")
    .style("z-index", -1)
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0)
    .style("opacity", 0)
    .style("pointer-events", "none")
    .style("box-sizing", "border-box")
    .style("max-width", `${width}px`);
  const node = root
    .append("div")
    .style("width", "fit-content")
    .style("height", "fit-content")
    .style("padding-left", `${paddingLeft}px`)
    .style("padding-top", `${paddingTop}px`)
    .style("padding-right", `${paddingRight}px`)
    .style("padding-bottom", `${paddingBottom}px`)
    .style("line-height", lineHeight)
    .style("font-size", `${fontSize}px`)
    .style("font-weight", fontWeight)
    .style("word-break", "break-word")
    .text(text)
    .node() as HTMLDivElement;
  const rect = node.getBoundingClientRect();
  root.remove();

  return {
    ...rect,
    width: rect.width + 1,
    height: rect.height + 1,
  };
};
