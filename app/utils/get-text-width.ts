import { theme } from "@/themes/federal";

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const fontFamily = theme.typography.fontFamily as string;

export const getTextWidth = (text: string, options: { fontSize: number }) => {
  ctx.font = `${options.fontSize}px ${fontFamily}`;
  return ctx.measureText(text).width;
};
