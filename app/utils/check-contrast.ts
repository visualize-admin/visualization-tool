import { rgb } from "d3-color";

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

export const checkContrast = (
  color: string,
  conrtastingColor: string = "#ffffffe6"
): boolean => {
  const contrastRgbColor = rgb(conrtastingColor);
  const { r, g, b } = contrastRgbColor;
  const whiteLuminance = getLuminance(r, g, b);
  const rgbColor = rgb(color);
  const colorLuminance = getLuminance(rgbColor.r, rgbColor.g, rgbColor.b);
  const contrastWithWhite = getContrastRatio(whiteLuminance, colorLuminance);
  return contrastWithWhite < MIN_CONTRAST;
};
