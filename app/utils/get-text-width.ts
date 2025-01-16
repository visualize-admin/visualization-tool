import { theme } from "@/themes/federal";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
const fontFamily = theme.typography.fontFamily as string;

export const getTextWidth = (text: string, options: { fontSize: number }) => {
  if (canvas === undefined && ctx === undefined) {
    canvas = document.createElement("canvas");
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  }

  ctx.font = `${options.fontSize}px ${fontFamily}`;

  return ctx.measureText(text).width;
};

export const getTextHeight = (
  text: string,
  options: {
    fontSize: number;
    width?: number;
    lineHeight?: number | string;
  }
) => {
  const measureDiv = document.createElement("div");

  measureDiv.style.font = `${options.fontSize}px ${fontFamily}`;
  measureDiv.style.position = "absolute";
  measureDiv.style.visibility = "hidden";
  measureDiv.style.lineHeight = options.lineHeight
    ? typeof options.lineHeight === "number"
      ? `${options.lineHeight}px`
      : options.lineHeight
    : "normal";

  if (options.width) {
    measureDiv.style.width = `${options.width}px`;
  } else {
    measureDiv.style.whiteSpace = "nowrap";
  }

  measureDiv.textContent = text;

  document.body.appendChild(measureDiv);

  const height = measureDiv.offsetHeight;

  document.body.removeChild(measureDiv);

  return height;
};
