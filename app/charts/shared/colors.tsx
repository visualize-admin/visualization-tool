import { color, RGBColor } from "d3";

export const convertHexToRgbArray = (
  hex: string,
  opacity?: number
): number[] => {
  const { r, g, b } = color(hex) as RGBColor;

  return opacity !== undefined ? [r, g, b, opacity] : [r, g, b];
};

export const convertRgbArrayToHex = (rgbArray: number[]): string => {
  switch (rgbArray.length) {
    case 3:
      return `rgb(${rgbArray.join(",")})`;
    case 4:
      return `rgba(${rgbArray.join(",")})`;
    default:
      throw new Error(
        `You need to pass 3 or 4 arguments when converting RGB array to HEX, while ${rgbArray.length} were provided.`
      );
  }
};
