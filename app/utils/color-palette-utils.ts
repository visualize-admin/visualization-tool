import { rgb } from "d3-color";
import { nanoid } from "nanoid";

import {
  CustomPaletteType,
  DivergingPaletteType,
  PaletteType,
  SequentialPaletteType,
} from "@/config-types";
import {
  createDivergingInterpolator,
  createSequentialInterpolator,
  type Palette,
} from "@/palettes";

const SRGB_THRESHOLD = 0.03928;
const SRGB_SCALE_FACTOR = 12.92;
const GAMMA = 2.4;
const GAMMA_SCALE = 1.055;
const GAMMA_OFFSET = 0.055;

const RED_LUMINANCE_FACTOR = 0.2126;
const GREEN_LUMINANCE_FACTOR = 0.7152;
const BLUE_LUMINANCE_FACTOR = 0.0722;

const CONTRAST_OFFSET = 0.05;
const MIN_CONTRAST = 2;

const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= SRGB_THRESHOLD
      ? c / SRGB_SCALE_FACTOR
      : Math.pow((c + GAMMA_OFFSET) / GAMMA_SCALE, GAMMA);
  });
  return (
    RED_LUMINANCE_FACTOR * rs +
    GREEN_LUMINANCE_FACTOR * gs +
    BLUE_LUMINANCE_FACTOR * bs
  );
};

const getContrastRatio = (l1: number, l2: number): number => {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + CONTRAST_OFFSET) / (darker + CONTRAST_OFFSET);
};

export const hasEnoughContrast = (
  color: string,
  conrtastingHexColor: string = "#ffffffe6"
): boolean => {
  const contrastRgbColor = rgb(conrtastingHexColor);
  const { r, g, b } = contrastRgbColor;
  const whiteLuminance = getLuminance(r, g, b);
  const rgbColor = rgb(color);
  const colorLuminance = getLuminance(rgbColor.r, rgbColor.g, rgbColor.b);
  const contrastWithWhite = getContrastRatio(whiteLuminance, colorLuminance);
  return contrastWithWhite < MIN_CONTRAST;
};

export const createColorId = (): string => nanoid(4);

type ColorPaletteType = "sequential" | "diverging";

interface ColorConfig {
  colors?: string[];
  paletteType?: ColorPaletteType;
  paletteId: string;
}

export const getFittingColorInterpolator = (
  config: {
    currentPalette?: Palette<SequentialPaletteType | DivergingPaletteType>;
    customPalette?: CustomPaletteType;
    color?: ColorConfig;
    defaultPalette?: Palette<SequentialPaletteType | DivergingPaletteType>;
  },
  getColorInterpolator: (
    paletteId: PaletteType["paletteId"]
  ) => (t: number) => string
): ((t: number) => string) => {
  if (config.color) {
    if (config.color.colors) {
      if (config.color.paletteType === "sequential") {
        return createSequentialInterpolator({
          endColorHex: config.color.colors[0],
          startColorHex: config.color.colors[1],
        }).interpolator;
      }
      if (config.color.paletteType === "diverging") {
        return createDivergingInterpolator({
          endColorHex: config.color.colors[0],
          startColorHex: config.color.colors[1],
          options: {
            midColorHex: config.color.colors[2] ?? undefined,
          },
        }).interpolator;
      }
    }
    return getColorInterpolator(config.color.paletteId);
  }

  if (config.currentPalette?.interpolator) {
    return config.currentPalette.interpolator;
  }

  if (config.customPalette) {
    if (config.customPalette.type === "sequential") {
      return createSequentialInterpolator({
        endColorHex: config.customPalette.colors[0],
        startColorHex: config.customPalette.colors[1],
      }).interpolator;
    }
    if (config.customPalette.type === "diverging") {
      return createDivergingInterpolator({
        endColorHex: config.customPalette.colors[0],
        startColorHex: config.customPalette.colors[1],
        options: {
          midColorHex: config.customPalette.colors[2] ?? undefined,
        },
      }).interpolator;
    }
  }

  return config.defaultPalette?.interpolator ?? getColorInterpolator("default");
};
