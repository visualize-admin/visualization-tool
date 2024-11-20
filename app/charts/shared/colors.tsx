import { color, RGBColor } from "d3-color";

import { Component } from "@/domain/data";

export const colorToRgbArray = (_color: string, opacity?: number): number[] => {
  const { r, g, b } = color(_color) as RGBColor;

  return opacity !== undefined ? [r, g, b, opacity] : [r, g, b];
};

export const rgbArrayToHex = (rgbArray: number[]): string => {
  switch (rgbArray.length) {
    case 3:
      return `rgb(${rgbArray.join(",")})`;
    case 4:
      return `rgba(${rgbArray.join(",")})`;
    default:
      throw Error(
        `You need to pass 3 or 4 arguments when converting RGB array to HEX, while ${rgbArray.length} were provided.`
      );
  }
};

export const hasDimensionColors = (d?: Component): d is Component => {
  return !!d?.values?.some((d) => d.color !== undefined);
};
