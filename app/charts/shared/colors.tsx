import { color, RGBColor } from "d3";

export const convertHexToRgbArray = (hex: string): [number, number, number] => {
  const { r, g, b } = color(hex) as RGBColor;

  return [r, g, b];
};
