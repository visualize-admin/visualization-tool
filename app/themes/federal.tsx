import { Breakpoint, createTheme } from "@mui/material/styles";
import omit from "lodash/omit";

import { theme as baseTheme } from "@/themes/base";

const breakpoints = ["xs", "md"] as Breakpoint[];

const createTypographyVariant = (spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${spec.lineHeight[i]}px`;
    const fontSize = `${spec.fontSize[i]}px`;
    res[baseTheme.breakpoints.up(breakpoints[i])] = {
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
  palette: {
    primary: {
      light: "#d8e8ef",
      main: "#006699",
      hover: "#004B70",
      active: "#00334D",
      disabled: "#599cbd",
    },
    divider: "#E5E5E5",
    action: {
      hover: "#F2F7F9",
    },
    secondary: {
      main: "#757575",
      hover: "#616161",
      active: "#4F4F4F",
      disabled: "#A5A5A5",
    },
    success: {
      main: "#3c763d",
      light: "#DFF0D8",
      hover: "#3c763d",
      active: "#3c763d",
      disabled: "#DFF0D8",
    },
    muted: {
      main: "#F5F5F5",
      colored: "#F9FAFB",
      dark: "#F2F7F9",
    },
    brand: {
      main: "#DC0018",
    },
    hint: {
      main: "#757575",
    },
    alert: {
      main: "#DC0018",
      light: "#ffe6e1",
    },
    warning: {
      main: "#8a6d3b",
      light: "#FCF0B4",
    },
    info: {
      main: "#31708f",
      light: "#d9edf7",
    },
    error: {
      main: "#a82824",
      light: "#f2dede",
    },
    organization: {
      main: "#006699",
      light: "#d8e8ef", // same as primaryLight
    },
    category: {
      main: "#3c763d",
      light: "#DFF0D8", // same as successLight
    },
    grey: {
      100: "#FFFFFF",
      200: "#F5F5F5",
      300: "#E5E5E5",
      400: "#D5D5D5",
      500: "#CCCCCC",
      600: "#757575",
      700: "#454545",
      800: "#333333",
      900: "#000000",
    },
  },
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
    link: {
      textDecoration: "none",
    },
    h1: createTypographyVariant({
      fontSize: [24, 32],
      lineHeight: [36, 48],
      fontWeight: 700,
    }),
    h2: createTypographyVariant({
      fontSize: [18, 24],
      lineHeight: [28, 36],
      fontWeight: 500,
    }),
    h3: createTypographyVariant({
      fontSize: [16, 18],
      lineHeight: [24, 28],
      fontWeight: "bold",
    }),
    h4: createTypographyVariant({
      fontSize: [14, 16],
      lineHeight: [22, 24],
      fontWeight: "bold",
    }),
    h5: createTypographyVariant({
      fontSize: [14],
      lineHeight: [20],
      fontWeight: "bold",
    }),
    h6: createTypographyVariant({
      fontSize: [12],
      lineHeight: [18],
      fontWeight: "bold",
    }),
    body1: createTypographyVariant({
      fontSize: [14, 16],
      lineHeight: [22, 24],
      fontWeight: "regular",
    }),
    body2: createTypographyVariant({
      fontSize: [12, 14],
      lineHeight: [18, 20],
      fontWeight: "regular",
    }),
    caption: createTypographyVariant({
      fontSize: [12],
      lineHeight: [18],
      fontWeight: "regular",
    }),
  },
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
