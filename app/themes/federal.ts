/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `theme` should be a plain object, conforming to the `Theme` type.
 */
import { Theme } from "./index";

/**
 * Theme conforming to the Swiss Federal CD guidelines
 */
export const theme: Theme = {
  breakpoints: ["48em", "62em", "75em"],
  space: [
    "0",
    "0.25rem",
    "0.5rem",
    "0.75rem",
    "1rem",
    "1.5rem",
    "2rem",
    "4rem",
    "4.5rem",
  ],
  colors: {
    text: "monochrome900",
    background: "monochrome100",

    brand: "#DC0018",
    monochrome100: "#FFFFFF",
    monochrome200: "#F5F5F5",
    monochrome300: "#E5E5E5",
    monochrome400: "#D5D5D5",
    monochrome500: "#CCCCCC",
    monochrome600: "#757575",
    monochrome700: "#454545",
    monochrome800: "#333333",
    monochrome900: "#000000",

    primary: "#006699",
    primaryHover: "#004B70",
    primaryActive: "#00334D",
    primaryDisabled: "#599cbd",
    primaryLight: "#d8e8ef",

    secondary: "#757575",
    secondaryHover: "#616161",
    secondaryActive: "#454545",
    secondaryDisabled: "#a6a6a6",

    success: "#3c763d",
    successHover: "#3c763d",
    successActive: "#3c763d",
    successDisabled: "#DFF0D8",
    successLight: "#DFF0D8",

    muted: "#F5F5F5",
    mutedColored: "#F9FAFB",
    mutedDarker: "#F2F7F9",
    focus: "#333333",
    error: "#FF5555",
    hint: "#757575",
    missing: "#EFEFEF",

    alert: "#DC0018",
    alertLight: "#ffe6e1",
  },
  fonts: {
    body:
      "FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
    monospace: "Menlo, monospace",
  },
  fontSizes: [
    "0rem",
    "0.625rem",
    "0.75rem",
    "0.875rem",
    "1rem",
    "1.125rem",
    "1.5rem",
    "2rem",
    "2.5rem",
    "3rem",
    "4.5rem",
    "5.5rem",
  ],
  fontWeights: {
    light: 300,
    regular: 400,
    heading: 700,
    bold: 700,
  },
  // FIXME: should it be relative values? 1.5, etc.
  lineHeights: [
    "0rem",
    "1rem",
    "1.125rem",
    "1.25rem",
    "1.375rem",
    "1.5rem",
    "1.750rem",
    "2.250rem",
    "3rem",
    "4rem",
    "4.5rem",
  ],

  radii: {
    default: 3,
    bigger: 4,
    circle: 99999,
  },
  shadows: {
    primary: "0 3px 5px 0 rgba(0,0,0,0.10)",
    rightSide: "2px 0 4px 0 rgba(0,0,0,0.05)",
    leftSide: "-2px 0 2px 0 rgba(0,0,0,0.05)",
    tooltip: "0 2px 8px rgba(0, 0, 0, 0.25)",
  },
  text: {
    giga: {
      fontFamily: "body",
      lineHeight: [9, 10, 10],
      fontWeight: "light",
      fontSize: [8, 9, 9],
    },
    heading1: {
      fontFamily: "body",
      lineHeight: [7, 8, 8],
      fontWeight: "bold",
      fontSize: [6, 7, 7],
    },
    heading2: {
      fontFamily: "body",
      lineHeight: [6, 7, 7],
      fontWeight: "regular",
      fontSize: [5, 6, 6],
    },
    heading3: {
      fontFamily: "body",
      lineHeight: [5, 6, 6],
      fontWeight: "bold",
      fontSize: [4, 5, 5],
    },
    lead: {
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "bold",
      fontSize: [3, 4, 4],
    },
    paragraph1: {
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4],
    },
    paragraph2: {
      fontFamily: "body",
      lineHeight: [2, 4, 3],
      fontWeight: "regular",
      fontSize: [2, 3, 3],
    },
    table: {
      fontFamily: "body",
      lineHeight: [2, 4, 4],
      fontWeight: "regular",
      fontSize: [2, 3, 3],
    },
    meta: {
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
    },
  },
  styles: {
    // Overwrite default browser styles.
    root: {
      // "root" applies to "body"
      "@font-face": [
        {
          fontFamily: "FrutigerNeue",
          fontStyle: "normal",
          fontWeight: 700,
          src: `url("/static/fonts/FrutigerNeueW02-Bd.woff2") format("woff2"),
          url("/static/fonts/FrutigerNeueW02-Bd.woff") format("woff")`,
        },
        {
          fontFamily: "FrutigerNeue",
          fontStyle: "normal",
          fontWeight: 400,
          src: `url("/static/fonts/FrutigerNeueW02-Regular.woff2") format("woff2"),
          url("/static/fonts/FrutigerNeueW02-Regular.woff") format("woff")`,
        },
        {
          fontFamily: "FrutigerNeue",
          fontStyle: "normal",
          fontWeight: 300,
          src: `url("/static/fonts/FrutigerNeueW02-Light.woff2") format("woff2"),
          url("/static/fonts/FrutigerNeueW02-Light.woff") format("woff")`,
        },
        {
          fontFamily: "FrutigerNeue",
          fontStyle: "italic",
          fontWeight: 400,
          src: `url("/static/fonts/FrutigerNeueW02-It.woff2") format("woff2"),
          url("/static/fonts/FrutigerNeueW02-It.woff") format("woff")`,
        },
      ],

      bg: "monochrome100",
      margin: 0,
      padding: 0,
      fontFamily:
        "FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",

      // Hack around type error for vendor prefixed rules
      ...{
        // Use momentum-based scrolling on iOS devices
        WebkitOverflowScrolling: "touch",

        // Auto-hide scrollbars in Edge
        msOverflowStyle: "-ms-autohiding-scrollbar",
      },

      svg: {
        display: "block",
      },

      "*:focus": {
        outline: "3px solid #333333",
      },

      fieldset: {
        border: 0,
        padding: "0.01em 0 0 0",
        margin: 0,
        minWidth: 0,
      },
    },
  },
  buttons: {
    reset: {
      background: "transparent",
      border: "none",
    },
    primary: {
      bg: "primary",
      color: "monochrome100",
      borderRadius: "default",
      width: ["100%", "auto"],
      minWidth: "160px",
      px: 4,
      py: 3,
      fontFamily: "body",
      fontSize: 4,
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "primaryHover",
      },
      ":active": {
        bg: "primaryHover",
      },
      ":disabled": {
        cursor: "initial",
        bg: "primaryDisabled",
      },
    },
    success: {
      variant: "buttons.primary",
      bg: "successBase",
      ":hover": {
        bg: "successHover",
      },
      ":active": {
        bg: "successHover",
      },
      ":disabled": {
        cursor: "initial",
        bg: "successDisabled",
      },
    },
    outline: {
      variant: "buttons.primary",
      color: "primary",
      bg: "monochrome100",
      border: "1px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "primary",
      ":hover": {
        bg: "muted",
      },
      ":active": {
        bg: "muted",
      },
      ":disabled": {
        cursor: "initial",
        bg: "muted",
      },
    },
    secondary: {
      variant: "buttons.primary",
      bg: "secondary",
      ":hover": {
        bg: "secondaryHover",
      },
      ":active": {
        bg: "secondaryHover",
      },
      ":disabled": {
        cursor: "initial",
        bg: "secondaryDisabled",
      },
    },
    inverted: {
      bg: "monochrome100",
      color: "monochrome800",
      borderRadius: "default",
      width: ["100%", "auto"],
      minWidth: 160,
      px: 4,
      py: 3,
      fontFamily: "body",
      fontSize: 4,
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "monochrome300",
      },
      ":active": {
        bg: "monochrome400",
      },
      ":disabled": {
        cursor: "initial",
        color: "monochrome600",
        bg: "monochrome300",
      },
    },
    inline: {
      background: "transparent",
      color: "primary",
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [3, 3, 3],
      border: "none",
      cursor: "pointer",
      mb: 4,
      p: 0,
      ":hover": {
        color: "primaryHover",
      },
      ":disabled": {
        cursor: "initial",
        color: "monochrome500",
      },
    },
  },
};

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/static/fonts/FrutigerNeueW02-Bd.woff2",
  "/static/fonts/FrutigerNeueW02-Regular.woff2",
  "/static/fonts/FrutigerNeueW02-Light.woff2",
];
