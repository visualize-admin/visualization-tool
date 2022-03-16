/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `theme` should be a plain object, conforming to the `Theme` type.
 */
import { Breakpoint, createTheme, Theme } from "@mui/material/styles";
import { omit, merge } from "lodash";

const breakpoints = ["xs", "sm", "md"] as Breakpoint[];
const themeUIFontSizes = [
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
];

const themeUILineHeights = [
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
];
const themeUIFontWeights = {
  light: 300,
  regular: 400,
  heading: 700,
  bold: 700,
};
const createTypographyVariant = (theme: Theme, spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = Array.isArray(spec.lineHeight)
      ? spec.lineHeight[i]
      : spec.lineHeight;
    const fontSize = Array.isArray(spec.fontSize)
      ? spec.fontSize[i]
      : spec.fontSize;
    if (i === 0) {
      res.fontSize = themeUIFontSizes[fontSize];
      res.lineHeight = themeUILineHeights[lineHeight];
    }
    res[theme.breakpoints.down(breakpoints[i])] = {
      fontSize: themeUIFontSizes[i],
      lineHeight: themeUILineHeights[i],
    };
  }
  console.log(res);
  res.fontWeight =
    themeUIFontWeights[res.fontWeight as keyof typeof themeUIFontWeights] ||
    res.fontWeight;
  return res;
};

/**
 * Theme conforming to the Swiss Federal CD guidelines
 */
export const theme = createTheme({
  palette: {
    primary: {
      main: "#006699",
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
  breakpoints: {
    values: { xs: 768, sm: 992, md: 1200, lg: 1280, xl: 1360 },
  },
  spacing: [
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
});

// colors: {
//   text: "#000000",
//   background: "#FFFFFF",
//   brand: "#DC0018",

//   primary: "#006699",
//   primaryHover: "#004B70",
//   primaryActive: "#00334D",
//   primaryDisabled: "#599cbd",
//   primaryLight: "#d8e8ef",
//   secondary: "#757575",
//   secondaryHover: "#616161",
//   secondaryActive: "#454545",
//   secondaryDisabled: "#a6a6a6",
//   secondaryButton: "#757575",
//   secondaryButtonText: "white",
//   secondaryButtonHover: "#646464",
//   success: "#3c763d",
//   successHover: "#3c763d",
//   successActive: "#3c763d",
//   successDisabled: "#DFF0D8",
//   successLight: "#DFF0D8",
//   muted: "#F5F5F5",
//   mutedColored: "#F9FAFB",
//   mutedDarker: "#F2F7F9",
//   focus: "#333333",
//   error: "#FF5555",
//   hint: "#757575",
//   missing: "#EFEFEF",
//   alert: "#DC0018",
//   alertLight: "#ffe6e1",
//   warning: "#8a6d3b",
//   warningLight: "#fffab2",
//   organization: "#006699",
//   organizationLight: "#d8e8ef", // same as primaryLight
//   category: "#3c763d",
//   categoryLight: "#DFF0D8", // same as successLight
// },

// fontSizes: [
//   "0rem",
//   "0.625rem",
//   "0.75rem",
//   "0.875rem",
//   "1rem",
//   "1.125rem",
//   "1.5rem",
//   "2rem",
//   "2.5rem",
//   "3rem",
//   "4.5rem",
//   "5.5rem",
// ],
// fontWeights: {
//   light: 300,
//   regular: 400,
//   heading: 700,
//   bold: 700,
// },
// // FIXME: should it be relative values? 1.5, etc.
// lineHeights: [
//   "0rem",
//   "1rem",
//   "1.125rem",
//   "1.25rem",
//   "1.375rem",
//   "1.5rem",
//   "1.750rem",
//   "2.250rem",
//   "3rem",
//   "4rem",
//   "4.5rem",
// ],
// radii: {
//   default: 3,
//   bigger: 4,
//   xl: 25,
//   circle: 99999,
// },
// shadows: {
//   primary: "0 3px 5px 0 rgba(0,0,0,0.10)",
//   rightSide: "2px 0 4px 0 rgba(0,0,0,0.05)",
//   leftSide: "-2px 0 2px 0 rgba(0,0,0,0.05)",
//   tooltip: "0 2px 8px rgba(0, 0, 0, 0.25)",
// },
// text: {

// },
// styles: {
//   // Overwrite default browser styles.
//   root: {
//     // "root" applies to "body"
//     // @ts-ignore

//   },
// },
// buttons: {
//   reset: {
//     background: "transparent",
//     border: "none",
//   },
//   base: {
//     px: 4,
//     py: 3,
//     fontFamily: "body",
//     fontSize: 4,
//     borderRadius: "default",
//     transition: "background-color .2s",
//     cursor: "pointer",
//     display: "inline-flex",
//     alignItems: "center",
//     flexGrow: 0,
//     justifyContent: "center",
//     "& > svg": {
//       width: 22,
//       mt: -1,
//       mb: -1,
//     },
//     "& > svg:first-child": {
//       marginRight: 2,
//     },
//     "& > svg:last-child": {
//       marginLeft: 2,
//     },
//   },
//   primary: {
//     variant: "buttons.base",
//     backgroundColor: "primary.main",
//     color: "grey.100",
//     ":hover": {
//       backgroundColor: "primaryHover",
//     },
//     ":active": {
//       backgroundColor: "primaryHover",
//     },
//     ":disabled": {
//       cursor: "initial",
//       backgroundColor: "primaryDisabled",
//     },
//   },
//   "primary-small": {
//     variant: "buttons.base",
//     fontSize: 3,
//     fontWeight: "normal",
//     py: 2,
//     minWidth: "auto",
//     "& > svg:first-child": {
//       width: "auto",
//       marginRight: 1,
//     },
//     "& > svg:last-child": {
//       width: "auto",
//       marginLeft: 1,
//     },
//   },
//   success: {
//     variant: "buttons.base",
//     backgroundColor: "successBase",
//     ":hover": {
//       backgroundColor: "successHover",
//     },
//     ":active": {
//       backgroundColor: "successHover",
//     },
//     ":disabled": {
//       cursor: "initial",
//       backgroundColor: "successDisabled",
//     },
//   },
//   outline: {
//     variant: "buttons.base",
//     color: "primary",
//     backgroundColor: "grey.100",
//     border: "1px",
//     borderWidth: "1px",
//     borderStyle: "solid",
//     borderColor: "primary",
//     ":hover": {
//       backgroundColor: "muted",
//     },
//     ":active": {
//       backgroundColor: "muted",
//     },
//     ":disabled": {
//       cursor: "initial",
//       backgroundColor: "muted",
//     },
//   },
//   secondary: {
//     variant: "buttons.primary",
//     backgroundColor: "secondaryButton",
//     color: "secondaryButtonText",
//     ":hover": {
//       bg: "secondaryButtonHover",
//     },
//     ":active": {
//       bg: "secondaryButtonHover",
//     },
//     ":disabled": {
//       cursor: "initial",
//       bg: "secondaryDisabled",
//     },
//   },
//   inverted: {
//     variant: "buttons.base",
//     bg: "monochrome100",
//     color: "grey.800",
//     borderRadius: "default",
//     px: 4,
//     py: 3,
//     fontFamily: "body",
//     fontSize: 4,
//     transition: "background-color .2s",
//     cursor: "pointer",
//     ":hover": {
//       bg: "monochrome300",
//     },
//     ":active": {
//       bg: "monochrome400",
//     },
//     ":disabled": {
//       cursor: "initial",
//       color: "grey.600",
//       bg: "monochrome300",
//     },
//   },
//   inline: {
//     variant: "buttons.base",
//     background: "transparent",
//     color: "primary",
//     fontFamily: "body",
//     lineHeight: [1, 2, 2],
//     fontWeight: "regular",
//     fontSize: [3, 3, 3],
//     border: "none",
//     cursor: "pointer",
//     m: 0,
//     p: 0,
//     ":hover": {
//       color: "primaryHover",
//     },
//     ":disabled": {
//       cursor: "initial",
//       color: "grey.500",
//     },
//     "& > svg:first-child": {
//       width: "auto",
//       marginRight: 1,
//     },
//     "& > svg:last-child": {
//       width: "auto",
//       marginLeft: 1,
//     },
//   },
//   "inline-bold": {
//     variant: "buttons.base",
//     background: "transparent",
//     color: "grey.800",
//     fontFamily: "body",
//     lineHeight: [1, 2, 2],
//     fontWeight: "bold",
//     fontSize: [3, 3, 3],
//     border: "none",
//     cursor: "pointer",
//     m: 0,
//     p: 0,
//     ":hover": {
//       color: "primaryHover",
//     },
//     ":disabled": {
//       cursor: "initial",
//       color: "grey.500",
//     },
//     "& > svg:first-child": {
//       width: "auto",
//       marginRight: 1,
//     },
//     "& > svg:last-child": {
//       width: "auto",
//       marginLeft: 1,
//     },
//   },
//   selectColorPicker: {
//     color: "grey.700",
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     bg: "monochrome100",
//     p: 1,
//     height: "40px",
//     borderWidth: "1px",
//     borderStyle: "solid",
//     borderColor: "monochrome500",
//     ":hover": {
//       bg: "monochrome100",
//     },
//     ":active": {
//       backgroundColor: "grey.100",
//     },
//     ":disabled": {
//       cursor: "initial",
//       backgroundColor: "muted",
//     },
//   },
//   arrow: {
//     variant: "buttons.inline",
//     padding: "0 0.25rem",
//     lineHeight: "0.25rem",
//   },
// },
// links: {
//   initial: {
//     color: "inherit",
//     textDecoration: "none",
//     fontSize: "0.85rem",
//     "&:hover": {
//       textDecoration: "none",
//     },
//   },
//   primary: {
//     color: "primary",
//     textDecoration: "none",
//     wordBreak: "break-word",
//     "&:hover": {
//       textDecoration: "underline",
//     },
//   },
//   inline: {
//     display: "inline",
//     textDecoration: "none",
//     color: "primary",
//     textAlign: "left",
//     fontFamily: "body",
//     lineHeight: [1, 2, 2],
//     fontWeight: "regular",
//     fontSize: [1, 2, 2],
//     border: "none",
//     cursor: "pointer",
//     "&:hover": {
//       textDecoration: "underline",
//     },
//   },
// },
// };

theme.typography = merge(theme.typography, {
  fontFamily:
    "FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
  // giga: {
  //   fontFamily: "body",
  //   lineHeight: [9, 10, 10],
  //   fontWeight: "light",
  //   fontSize: [8, 9, 9],
  // },
  h1: createResponsiveVariant(theme, {
  h1: createTypographyVariant(theme, {
    lineHeight: [7, 8, 8],
    fontWeight: "bold",
    fontSize: [6, 7, 7],
  }),
  h2: createTypographyVariant(theme, {
    lineHeight: [6, 7, 7],
    fontWeight: "regular",
    fontSize: [5, 6, 6],
  }),
  h3: createTypographyVariant(theme, {
    lineHeight: [5, 6, 6],
    fontWeight: "bold",
    fontSize: [4, 5, 5],
  }),
  h4: createTypographyVariant(theme, {
    lineHeight: [4, 5, 5],
    fontWeight: "bold",
    fontSize: [3, 4, 4],
  }),
  body1: createTypographyVariant(theme, {
    lineHeight: [4, 5, 5],
    fontWeight: "regular",
    fontSize: [3, 4, 4],
  }),
  body2: createTypographyVariant(theme, {
    lineHeight: [2, 4, 3],
    fontWeight: "regular",
    fontSize: [2, 3, 3],
  }),
  // table: {
  //   fontFamily: "body",
  //   lineHeight: [2, 4, 4],
  //   fontWeight: "regular",
  //   fontSize: [2, 3, 3],
  // },
  caption: createTypographyVariant(theme, {
    lineHeight: [1, 2, 2],
    fontWeight: "regular",
    fontSize: [1, 2, 2],
  }),
});

theme.components = {
  MuiCard: {
    styleOverrides: {
      root: {
      },
    },
  },
    styleOverrides: {
      },
      },
      },
      },
  MuiCssBaseline: {
    styleOverrides: {
      margin: 0,
      padding: 0,
      fontFamily: theme.typography.fontFamily,
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
};

console.log(theme.typography);
/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/static/fonts/FrutigerNeueW02-Bd.woff2",
  "/static/fonts/FrutigerNeueW02-Regular.woff2",
  "/static/fonts/FrutigerNeueW02-Light.woff2",
];
