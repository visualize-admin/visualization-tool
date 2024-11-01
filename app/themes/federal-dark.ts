import { createTheme } from "@mui/material/styles";

import { theme as baseTheme } from "@/themes/base";

import { createTypographyVariant } from "./utils";

/**
 * Theme conforming to the Swiss Federal CD guidelines
 */
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#003347",
      main: "#0088cc",
      hover: "#00a3f5",
      active: "#33b5ff",
      disabled: "#1a4d66",
    },
    divider: "#2e2e2e",
    action: {
      hover: "#1a1a1a",
    },
    secondary: {
      main: "#9e9e9e",
      hover: "#b0b0b0",
      active: "#cccccc",
      disabled: "#666666",
    },
    success: {
      main: "#4caf50",
      light: "#1b3b1e",
      hover: "#66bb6a",
      active: "#81c784",
      disabled: "#2d4731",
    },
    muted: {
      main: "#1e1e1e",
      colored: "#1a1a1a",
      dark: "#141414",
    },
    brand: {
      main: "#ff1a1a",
    },
    hint: {
      main: "#9e9e9e",
    },
    alert: {
      main: "#f44336",
      light: "#311b1b",
    },
    warning: {
      main: "#ffc107",
      light: "#332b15",
    },
    info: {
      main: "#2196f3",
      light: "#1a2a33",
    },
    error: {
      main: "#f44336",
      light: "#331b1b",
    },
    organization: {
      main: "#0088cc",
      light: "#003347", // matches primaryLight
    },
    category: {
      main: "#4caf50",
      light: "#1b3b1e", // matches successLight
    },
    grey: {
      100: "#000000",
      200: "#1a1a1a",
      300: "#2e2e2e",
      400: "#424242",
      500: "#757575",
      600: "#9e9e9e",
      700: "#bdbdbd",
      800: "#e0e0e0",
      900: "#ffffff",
    },
  },
  typography: {
    fontFamily: ["FrutigerNeue", baseTheme.typography.fontFamily].join(","),
    link: {
      textDecoration: "none",
    },
    h1: createTypographyVariant(baseTheme, {
      fontSize: [24, 32],
      lineHeight: [36, 48],
      fontWeight: 700,
    }),
    h2: createTypographyVariant(baseTheme, {
      fontSize: [18, 24],
      lineHeight: [28, 36],
      fontWeight: 500,
    }),
    h3: createTypographyVariant(baseTheme, {
      fontSize: [16, 18],
      lineHeight: [24, 28],
      fontWeight: "bold",
    }),
    h4: createTypographyVariant(baseTheme, {
      fontSize: [14, 16],
      lineHeight: [22, 24],
      fontWeight: "bold",
    }),
    h5: createTypographyVariant(baseTheme, {
      fontSize: [14],
      lineHeight: [20],
      fontWeight: "bold",
    }),
    h6: createTypographyVariant(baseTheme, {
      fontSize: [12],
      lineHeight: [18],
      fontWeight: "bold",
    }),
    body1: createTypographyVariant(baseTheme, {
      fontSize: [14, 16],
      lineHeight: [22, 24],
      fontWeight: "regular",
    }),
    body2: createTypographyVariant(baseTheme, {
      fontSize: [12, 14],
      lineHeight: [18, 20],
      fontWeight: "regular",
    }),
    caption: createTypographyVariant(baseTheme, {
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
