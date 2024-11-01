import { Breakpoint, createTheme, Theme } from "@mui/material/styles";
import merge from "lodash/merge";
import omit from "lodash/omit";

import { components } from "./components";
import { palette } from "./palette";
import { shadows } from "./shadows";

const breakpoints = ["xs", "md"] as Breakpoint[];

const createTypographyVariant = (theme: Theme, spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${spec.lineHeight[i]}px`;
    const fontSize = `${spec.fontSize[i]}px`;
    res[theme.breakpoints.up(breakpoints[i])] = {
      fontSize,
      lineHeight,
    };
  }
  return res;
};

/**
 * Theme conforming to the Swiss Federal CD guidelines
 */
export const theme = createTheme({
  palette,
  breakpoints: {
    values: { xs: 0, sm: 768, md: 992, lg: 1280, xl: 1360 },
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 64, 72],
  shape: {
    borderRadius: 2,
  },
  shadows,

  typography: {
    fontFamily: [
      "FrutigerNeue",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Helvetica",
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
    ].join(","),
  },
  components,
});

theme.typography = merge(theme.typography, {
  link: {
    textDecoration: "none",
  },
  h1: createTypographyVariant(theme, {
    fontSize: [24, 32],
    lineHeight: [36, 48],
    fontWeight: 700,
  }),
  h2: createTypographyVariant(theme, {
    fontSize: [18, 24],
    lineHeight: [28, 36],
    fontWeight: 500,
  }),
  h3: createTypographyVariant(theme, {
    fontSize: [16, 18],
    lineHeight: [24, 28],
    fontWeight: "bold",
  }),
  h4: createTypographyVariant(theme, {
    fontSize: [14, 16],
    lineHeight: [22, 24],
    fontWeight: "bold",
  }),
  h5: createTypographyVariant(theme, {
    fontSize: [14],
    lineHeight: [20],
    fontWeight: "bold",
  }),
  h6: createTypographyVariant(theme, {
    fontSize: [12],
    lineHeight: [18],
    fontWeight: "bold",
  }),
  body1: createTypographyVariant(theme, {
    fontSize: [14, 16],
    lineHeight: [22, 24],
    fontWeight: "regular",
  }),
  body2: createTypographyVariant(theme, {
    fontSize: [12, 14],
    lineHeight: [18, 20],
    fontWeight: "regular",
  }),
  caption: createTypographyVariant(theme, {
    fontSize: [12],
    lineHeight: [18],
    fontWeight: "regular",
  }),
});

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/static/fonts/FrutigerNeueW02-Bd.woff2",
  "/static/fonts/FrutigerNeueW02-Regular.woff2",
  "/static/fonts/FrutigerNeueW02-Light.woff2",
  "/static/fonts/FrutigerNeueW02-It.woff2",
];
