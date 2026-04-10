import { Color, createTheme } from "@mui/material";
import { CSSProperties } from "react";

import { breakpoints } from "@/federal-ci/theme/breakpoints";
import { createTypographyVariant } from "@/federal-ci/theme/utils";

export { breakpoints };

/** Use for MUI theme augmentation. */
export type FederalBreakpointOverrides = {
  xxs: true;
  xs: true;
  sm: true;
  md: true;
  lg: true;
  xl: true;
  xxl: true;
  xxxl: true;
};

export type FederalColor = Omit<Color, "A100" | "A200" | "A400" | "A700">;

/** Shorthand for `theme.palette`. */
export const c = {
  cobalt: {
    50: "#F0F4F7",
    100: "#DFE4E9",
    200: "#ACB4BD",
    300: "#828E9A",
    400: "#596978",
    500: "#46596B",
    600: "#2F4356",
    700: "#263645",
    800: "#1C2834",
    900: "#131B22",
  },
  monochrome: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
  red: {
    50: "#FFEDEE",
    100: "#FAE1E2",
    200: "#FFCCCE",
    300: "#FA9DA1",
    400: "#FC656B",
    500: "#E53940",
    600: "#D8232A",
    700: "#BF1F25",
    800: "#99191E",
    900: "#7F1519",
  },
  background: {
    paper: "#FFFFFF",
  },
  border: {
    active: "#D8232A",
  },
  error: {
    main: "#99191E",
    light: "#FFEDEE",
  },
  info: {
    main: "#1D4ED8",
    light: "#EFF6FF",
  },
  primary: {
    main: "#D8232A",
    dark: "#BF1F25",
  },
  secondary: {
    main: "#596978",
    dark: "#2F4356",
  },
  success: {
    main: "#065F46",
    light: "#ECFDF5",
  },
  text: {
    primary: "#1F2937",
    activeLink: "#BF1F25",
  },
  warning: {
    main: "#9A3412",
    light: "#FFEDD5",
  },
};

/** Shorthand for `theme.shadows` (elevation). */
export const e = [
  "none",
  "0px 1px 2px 0px rgba(0, 0, 0, 0.05)",
  "0px 1px 2px 0px rgba(0, 0, 0, 0.06), 0px 1px 5px 0px rgba(0, 0, 0, 0.08)",
  "0px 2px 4px -1px rgba(0, 0, 0, 0.06), 0px 4px 10px -1px rgba(0, 0, 0, 0.08)",
  "0px 2px 6px -1px rgba(0, 0, 0, 0.05), 0px 5px 20px -2px rgba(0, 0, 0, 0.08)",
  "0px 6px 10px -5px rgba(0, 0, 0, 0.04), 0px 15px 25px -3px rgba(0, 0, 0, 0.08)",
  "0px 10px 70px -8px rgba(0, 0, 0, 0.13), 0px 10px 20px 0px rgba(0, 0, 0, 0.05)",
];

export const theme = createTheme({
  breakpoints: {
    values: breakpoints,
  },
  spacing: 4,
  // @ts-expect-error - c doesn't satisfy augmented PaletteOptions (app adds extra required keys)
  palette: c,
});

/** Shorthand for `theme.breakpoints`. */
export const b = theme.breakpoints;

/** Use for MUI theme augmentation. */
export type FederalTypographyVariants = {
  display1: CSSProperties;
  display2: CSSProperties;
  body3: CSSProperties;
};

/** Use for MUI theme augmentation. */
export type FederalTypographyVariantsOptions = {
  display1: CSSProperties;
  display2: CSSProperties;
  body3: CSSProperties;
};

/** Use for MUI theme augmentation. */
export type FederalTypographyPropsVariantOverrides = {
  display1: true;
  display2: true;
  body3: true;
};

/** Shorthand for `theme.typography`. */
export const t = {
  display1: createTypographyVariant(b, {
    fontSize: [38, 64],
    lineHeight: "110%",
  }),
  display2: createTypographyVariant(b, {
    fontSize: [30, 48],
    lineHeight: "110%",
  }),
  h1: createTypographyVariant(b, {
    fontSize: [24, 32],
    lineHeight: "130%",
  }),
  h2: createTypographyVariant(b, {
    fontSize: [20, 24],
    lineHeight: "140%",
  }),
  h3: createTypographyVariant(b, {
    fontSize: [18, 20],
    lineHeight: "160%",
  }),
  h4: createTypographyVariant(b, {
    fontSize: [16, 18],
    lineHeight: "155%",
  }),
  h5: createTypographyVariant(b, {
    fontSize: [14, 16],
    lineHeight: "150%",
  }),
  h6: createTypographyVariant(b, {
    fontSize: [12, 14],
    lineHeight: "140%",
  }),
  body1: createTypographyVariant(b, {
    fontSize: [16, 18],
    lineHeight: "150%",
  }),
  body2: createTypographyVariant(b, {
    fontSize: [14, 16],
    lineHeight: "150%",
  }),
  body3: createTypographyVariant(b, {
    fontSize: [12, 14],
    lineHeight: "150%",
  }),
  caption: createTypographyVariant(b, {
    fontSize: [12, 12],
    lineHeight: "150%",
  }),
};

/** Shorthand for `theme.spacing`. */
export const s = theme.spacing;
