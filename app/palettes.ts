import {
  interpolateBlues,
  interpolateBrBG,
  interpolateGreens,
  interpolateGreys,
  interpolateOranges,
  interpolatePiYG,
  interpolatePRGn,
  interpolatePuOr,
  interpolatePurples,
  interpolateRdBu,
  interpolateRdYlBu,
  interpolateRdYlGn,
  interpolateReds,
  schemeAccent,
  schemeCategory10,
  schemeDark2,
  schemePaired,
  schemePastel1,
  schemePastel2,
  schemeSet1,
  schemeSet2,
  schemeSet3,
  schemeTableau10,
} from "d3-scale-chromatic";

import { hasDimensionColors } from "./charts/shared/colors";
import { DivergingPaletteType, SequentialPaletteType } from "./config-types";
import { Component } from "./domain/data";

// Colors
export const getDefaultCategoricalPaletteId = (
  d?: Component,
  previousPaletteName?: string
): string => {
  const hasColors = hasDimensionColors(d);
  return hasColors
    ? "dimension"
    : previousPaletteName || DEFAULT_CATEGORICAL_PALETTE_NAME;
};

export const getDefaultCategoricalPalette = (
  colors?: string[]
): CategoricalPalette => {
  if (colors) {
    return {
      label: "default",
      value: "dimension",
      colors: colors.slice(0, 10),
    };
  } else {
    return categoricalPalettes[0];
  }
};

export const getPaletteId = (
  palette?: string,
  colors?: string[]
): ReadonlyArray<string> => {
  switch (palette) {
    case "dimension":
      return getDefaultCategoricalPalette(colors).colors;
    case "accent":
      return schemeAccent;
    case "category10":
      return schemeCategory10;
    case "dark2":
      return schemeDark2;
    case "paired":
      return schemePaired;
    case "pastel1":
      return schemePastel1;
    case "pastel2":
      return schemePastel2;
    case "set1":
      return schemeSet1;
    case "set2":
      return schemeSet2;
    case "set3":
      return schemeSet3;
    case "tableau10":
      return schemeTableau10;

    default:
      return schemeCategory10;
  }
};

type CategoricalPalette = {
  label: string;
  value: string;
  colors: ReadonlyArray<string>;
};

export const categoricalPalettes: Array<CategoricalPalette> = [
  {
    label: "category10",
    value: "category10",
    colors: getPaletteId("category10"),
  },
  { label: "accent", value: "accent", colors: getPaletteId("accent") },
  { label: "dark2", value: "dark2", colors: getPaletteId("dark2") },
  { label: "paired", value: "paired", colors: getPaletteId("paired") },
  { label: "pastel1", value: "pastel1", colors: getPaletteId("pastel1") },
  { label: "pastel2", value: "pastel2", colors: getPaletteId("pastel2") },
  { label: "set1", value: "set1", colors: getPaletteId("set1") },
  { label: "set2", value: "set2", colors: getPaletteId("set2") },
  { label: "set3", value: "set3", colors: getPaletteId("set3") },
];

export const DEFAULT_CATEGORICAL_PALETTE_NAME = categoricalPalettes[0].value;

export type Palette<T> = {
  label: string;
  value: T;
  interpolator: (t: number) => string;
};
type SteppedPalette<T> = Omit<Palette<T>, "interpolator"> & {
  colors: ReadonlyArray<string>;
};
const steppedPaletteSteps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
const divergingPaletteKeys: DivergingPaletteType[] = [
  "RdBu",
  "RdYlBu",
  "RdYlGn",
  "BrBG",
  "PRGn",
  "PiYG",
  "PuOr",
];
const sequentialPaletteKeys: SequentialPaletteType[] = [
  "blues",
  "greens",
  "greys",
  "oranges",
  "purples",
  "reds",
];
const interpolatorByName = {
  RdBu: interpolateRdBu,
  RdYlBu: interpolateRdYlBu,
  RdYlGn: interpolateRdYlGn,
  BrBG: interpolateBrBG,
  PRGn: interpolatePRGn,
  PiYG: interpolatePiYG,
  PuOr: interpolatePuOr,
  blues: interpolateBlues,
  greens: interpolateGreens,
  greys: interpolateGreys,
  oranges: interpolateOranges,
  purples: interpolatePurples,
  reds: interpolateReds,
};
const defaultInterpolator = interpolatorByName["oranges"];

export const getColorInterpolator = (
  palette: SequentialPaletteType | DivergingPaletteType
): ((t: number) => string) => {
  const interpolator = interpolatorByName[palette] ?? defaultInterpolator;
  // If the palette is sequential, we artificially clamp the value not to display too
  // white a value
  const isSequential = palette
    ? // @ts-ignore
      sequentialPaletteKeys.includes(palette)
    : false;
  return isSequential
    ? (n: number) => interpolator(n * 0.8 + 0.2)
    : interpolator;
};

export const divergingPalettes = divergingPaletteKeys.map((d) => ({
  label: d,
  value: d,
  interpolator: getColorInterpolator(d),
})) as Palette<DivergingPaletteType>[];

export const divergingSteppedPalettes = divergingPaletteKeys.map((d) => ({
  label: d,
  value: d,
  colors: steppedPaletteSteps.map((s) => getColorInterpolator(d)(s)),
})) as SteppedPalette<DivergingPaletteType>[];

export const getDefaultDivergingSteppedPalette = () =>
  divergingSteppedPalettes[0];

export const sequentialPalettes = sequentialPaletteKeys.map((d) => ({
  label: d,
  value: d,
  interpolator: getColorInterpolator(d),
})) as Palette<SequentialPaletteType>[];
