import { ThemeOptions } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";

import { createTypographyVariant } from "./utils";

/**
 * Theme conforming to the Schleswig-Holstein guidelines
 */
export const theme: ThemeOptions = {
  palette: {
    primary: {
      light: "#B7CDE3",
      main: "#003064",
      hover: "#D4004B",
      active: "#D4004B",
      disabled: "#B4BAC0",
    },
    divider: "#E3E5ED",
    action: {
      hover: "#EDEEF2",
    },
    secondary: {
      main: "#003064",
      hover: "#D4004B",
      active: "#D4004B",
      disabled: "#B4BAC0",
    },
    success: {
      main: "#157A6D",
      light: "#DFF0D8",
      hover: "#157A6D",
      active: "#157A6D",
      disabled: "#B4BAC0",
    },
    muted: {
      main: "#EDEEF2",
      colored: "#F4F5F7",
      dark: "#F2F7F9",
    },
    hint: {
      main: "#64768F",
    },
    alert: {
      main: "#DC0018",
      light: "#FFE6E1",
    },
    warning: {
      main: "#8F845F",
      light: "#FCF0B4",
    },
    info: {
      main: "#3A78B8",
      light: "#C4D6E7",
    },
    error: {
      main: "#96205E",
      light: "#EEDBE8",
    },
    organization: {
      main: "#295481",
      contrastText: "#FFFFFF",
      light: "#B7CDE3",
      onLight: "#001E49",
    },
    category: {
      main: "#7F406D",
      contrastText: "#FFFFFF",
      light: "#E2C3D9",
      onLight: "#001E49",
    },
    termset: {
      main: "#2F3947",
      contrastText: "#FFFFFF",
      light: "#E3E5ED",
      onLight: "#001E49",
    },
    grey: {
      100: "#FFFFFF",
      200: "#F4F5F7",
      300: "#EDEEF2",
      400: "#E3E5ED",
      500: "#B4BAC0",
      600: "#64768F",
      700: "#525E71",
      800: "#2F3947",
      900: "#212529",
    },
  },
  typography: {
    fontFamily: ["Avenir LT Pro", baseTheme.typography.fontFamily].join(","),
    link: {
      textDecoration: "none",
    },
    h1: createTypographyVariant(baseTheme, {
      fontSize: [48],
      lineHeight: ["140%"],
      fontWeight: 400,
    }),
    h2: createTypographyVariant(baseTheme, {
      fontSize: [32],
      lineHeight: ["130%"],
      fontWeight: 300,
    }),
    h3: createTypographyVariant(baseTheme, {
      fontSize: [24],
      lineHeight: ["135%"],
      fontWeight: 400,
    }),
    h4: createTypographyVariant(baseTheme, {
      fontSize: [18],
      lineHeight: ["140%"],
      fontWeight: 400,
    }),
    h5: createTypographyVariant(baseTheme, {
      fontSize: [16],
      lineHeight: ["120%"],
      fontWeight: 400,
    }),
    h6: createTypographyVariant(baseTheme, {
      fontSize: [14],
      lineHeight: ["120%"],
      fontWeight: 400,
    }),
    body1: createTypographyVariant(baseTheme, {
      fontSize: [18],
      lineHeight: ["140%"],
      fontWeight: 300,
    }),
    body2: createTypographyVariant(baseTheme, {
      fontSize: [16],
      lineHeight: ["130%"],
      fontWeight: 300,
    }),
    caption: createTypographyVariant(baseTheme, {
      fontSize: [12],
      lineHeight: ["130%"],
      fontWeight: 300,
    }),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
            ${baseTheme.components?.MuiCssBaseline?.styleOverrides}  
                
            @font-face {
              font-family: "Avenir LT Pro";
              font-display: swap;
              font-style: normal;
              font-weight: 300;
              src: url("/static/fonts/AvenirLTPro-Light.woff2") format("woff2");
            }
      
            @font-face {
              font-family: "Avenir LT Pro";
              font-display: swap;
              font-style: normal;
              font-weight: 400;
              src: url("/static/fonts/AvenirLTPro-Regular.woff2") format("woff2");
            }
            
            @font-face {
              font-family: "Avenir LT Pro";
              font-display: swap;
              font-style: italic;
              font-weight: 400;
              src: url("/static/fonts/AvenirLTPro-It.woff2") format("woff2");
            }
            `,
    },
  },
};

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/static/fonts/AvenirLTPro-It.woff2",
  "/static/fonts/AvenirLTPro-Light.woff2",
  "/static/fonts/AvenirLTPro-Regular.woff2",
];
