import { theme } from "@/themes/theme";

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
