import {
  Components,
  createTheme,
  Theme,
  ThemeOptions,
} from "@mui/material/styles";
import merge from "lodash/merge";
import omit from "lodash/omit";

import { theme as federalTheme } from "@/themes/federal";
import { createTypographyVariant } from "@/themes/typography";

export const theme = createTheme(
  omit(federalTheme, ["typography", "palette"]),
  {
    palette: {
      primary: {
        main: "#00304D",
        light: "#F2F4F6",
        hover: "#F2F4F6",
      },
      secondary: {
        main: "#FFB400",
        light: "#FFF0D9",
        hover: "#FFF0D9",
      },
      success: {
        main: "#008030",
        hover: "#D9ECE0",
      },
      error: {
        main: "#BF2626",
        hover: "#F6DFDF",
      },
      brand: {
        main: "#FFB400",
      },
      organization: {
        main: "#00304D",
        light: "#F2F4F6", // same as primaryLight
      },
      category: {
        main: "#FFB400",
        light: "#FFF0D9", // same as successLight
      },
    },
    typography: {
      fontFamily: [
        "Inter",
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
  } as ThemeOptions
);

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
    fontWeight: 600,
  }),
  h3: createTypographyVariant(theme, {
    fontSize: [16, 18],
    lineHeight: [24, 28],
    fontWeight: 600,
  }),
  h4: createTypographyVariant(theme, {
    fontSize: [14, 16],
    lineHeight: [22, 24],
    fontWeight: 600,
  }),
  h5: createTypographyVariant(theme, {
    fontSize: [12, 14],
    lineHeight: [18, 20],
    fontWeight: 600,
  }),
  h6: createTypographyVariant(theme, {
    fontSize: [12, 14],
    lineHeight: [18, 20],
    fontWeight: 600,
  }),
  body1: createTypographyVariant(theme, {
    fontSize: [14, 16],
    lineHeight: [22, 24],
    fontWeight: 500,
  }),
  body2: createTypographyVariant(theme, {
    fontSize: [12, 14],
    lineHeight: [16, 20],
    fontWeight: 500,
  }),
  caption: createTypographyVariant(theme, {
    fontSize: [10, 12],
    lineHeight: [16, 18],
    fontWeight: 500,
  }),
});

theme.components = merge(theme.components, {
  MuiCssBaseline: {
    styleOverrides: `
        svg {
          display: block
        }
  
        *:focus {
          outline: 3px solid #333333;
        }

        [tabindex="-1"]:focus { outline: 0; }
    
        fieldset {
          border: 0;
          padding: 0.01em 0 0 0;
          margin: 0;
          minWidth: 0;
        }
  
        html {
          margin: 0;
          padding: 0;
          font-family: ${theme.typography.fontFamily};
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: -ms-autohiding-scrollbar;
        }
  
        @font-face {
          font-family: "Inter";
          font-display: swap;
          font-style: normal;
          font-weight: 500;
          src: url("/static/fonts/Inter-Medium.ttf") format("ttf");
        }
  
        @font-face {
          font-family: "Inter";
          font-display: swap;
          font-style: normal;
          font-weight: 600;
          src: url("/static/fonts/Inter-SemiBold.ttf") format("ttf");
        }
  
        @font-face {
          font-family: "Inter";
          font-display: swap;
          font-style: normal;
          font-weight: 700;
          src: url("/static/fonts/Inter-Bold.ttf") format("ttf");
        }
        `,
  },
} as Components<Theme>);

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/static/fonts/Inter-Medium.ttf",
  "/static/fonts/Inter-SemiBold.ttf",
  "/static/fonts/Inter-Bold.ttf",
];
