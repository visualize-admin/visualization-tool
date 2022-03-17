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
import { Icon } from "../icons";
import shadows from "./shadows";

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
  regular: 500,
  heading: 700,
  bold: 700,
};

const createTypographyVariant = (theme: Theme, spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeightIndex = Array.isArray(spec.lineHeight)
      ? spec.lineHeight[i]
      : spec.lineHeight;
    const fontSizeIndex = Array.isArray(spec.fontSize)
      ? spec.fontSize[i]
      : spec.fontSize;
    if (i === 0) {
      res.fontSize = themeUIFontSizes[fontSizeIndex];
    }
    res[theme.breakpoints.up(breakpoints[i])] = {
      fontSize: themeUIFontSizes[fontSizeIndex],
      lineHeight: themeUILineHeights[lineHeightIndex],
    };
  }
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
      light: "#d8e8ef",
      main: "#006699",
      hover: "#004B70",
      active: "#00334D",
      disabled: "#599cbd",
    },
    divider: "#CCCCCC",
    secondary: {
      main: "#757575",
      hover: "#616161",
      active: "#454545",
      disabled: "#a6a6a6",
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
      light: "#fffab2",
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
  shape: {
    borderRadius: 2,
  },
  shadows: shadows,

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
});

// colors: {
//   text: "#000000",
//   background: "#FFFFFF",
//   secondaryButton: "#757575",
//   secondaryButtonText: "white",
//   secondaryButtonHover: "#646464",
//   success: "#3c763d",
//   focus: "#333333",
//   error: "#FF5555",
//   missing: "#EFEFEF",
// },

//   primary: {
//     variant: "buttons.base",
//     backgroundColor: "primary.main",
//     color: "grey.100",
//     ":hover": {
//       backgroundColor: "primary.hover",
//     },
//     ":active": {
//       backgroundColor: "primary.hover",
//     },
//     ":disabled": {
//       cursor: "initial",
//       backgroundColor: "primary.disabled",
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
//       backgroundColor: "muted.main",
//     },
//     ":active": {
//       backgroundColor: "muted.main",
//     },
//     ":disabled": {
//       cursor: "initial",
//       backgroundColor: "muted.main",
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
//       bg: "secondary.disabled",
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

theme.typography = merge(theme.typography, {
  link: {
    textDecoration: "none",
  },
  h1: createTypographyVariant(theme, {
    lineHeight: 1.5,
    fontWeight: "bold",
    fontSize: [6, 8, 8],
  }),
  h2: createTypographyVariant(theme, {
    lineHeight: 1.25,
    fontWeight: 500,
    fontSize: [5, 6, 6],
  }),
  h3: createTypographyVariant(theme, {
    lineHeight: 1.25,
    fontWeight: "bold",
    fontSize: [4, 5, 5],
  }),
  h4: createTypographyVariant(theme, {
    lineHeight: 1.25,
    fontWeight: "bold",
    fontSize: [3, 4, 4],
  }),
  h5: createTypographyVariant(theme, {
    lineHeight: 1.25,
    fontWeight: "bold",
    fontSize: [2, 3, 3],
  }),
  body1: createTypographyVariant(theme, {
    lineHeight: 1.5,
    fontWeight: "regular",
    fontSize: [3, 4, 4],
  }),
  body2: createTypographyVariant(theme, {
    lineHeight: 1.5,
    fontWeight: "regular",
    fontSize: [2, 3, 3],
  }),
  lead: createTypographyVariant(theme, {
    lineHeight: [4, 5, 5],
    fontWeight: "bold",
    fontSize: [3, 4, 4],
  }),
  tag: createTypographyVariant(theme, {
    lineHeight: 1.25,
    fontSize: [2, 2, 2],
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
  MuiLink: {
    defaultProps: {
      underline: "hover",
      color: "inherit",
    },
    styleOverrides: {},
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        textAlign: "left",
        pr: 1,
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        display: "-webkit-box",
        overflow: "hidden",
        fontSize: themeUIFontSizes[3],
      },
      sizeSmall: {
        fontSize: themeUIFontSizes[2],
      },
    },
  },
  MuiButton: {
    variants: [
      {
        props: { variant: "selectColorPicker" },
        style: {
          color: "grey.700",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bg: "monochrome100",
          p: 1,
          height: "40px",
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: theme.palette.divider,
          ":hover": {
            bg: "monochrome100",
          },
          ":active": {
            backgroundColor: "grey.100",
          },
          ":disabled": {
            cursor: "initial",
            backgroundColor: "muted.main",
          },
        },
      },
      {
        props: { variant: "inline" },
        style: {
          backgroundColor: "transparent",
          ":hover": {
            backgroundColor: "transparent",
          },
          fontSize: theme.typography.body2.fontSize,
          padding: 0,
          margin: 0,
          minHeight: "1rem",
          color: theme.palette.primary.main,
          ":active": {
            backgroundColor: "grey.100",
          },
          ":disabled": {
            color: "grey.500",
          },
        },
      },
    ],
    defaultProps: {
      variant: "contained",
      color: "primary",
    },
    styleOverrides: {
      sizeMedium: {
        fontSize: 14,
        lineHeight: "24px",
        minHeight: 40,
      },
      sizeLarge: {
        fontSize: "1rem",
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
        minHeight: 44,

        ".MuiButton-startIcon > :nth-of-type(1)": {
          width: 20,
          height: 20,
        },
      },
      root: {
        padding: `${theme.spacing(4)}px ${theme.spacing(3)}px`,
        alignItems: "center",
        lineHeight: 1.25,
        justifyContent: "flex-start",
        borderRadius: 3,
        transition: "background-color .2s",
        cursor: "pointer",
        display: "inline-flex",
        flexGrow: 0,

        "& > svg": {
          width: 22,
          marginTop: -1,
          marginBottom: -1,
        },
        "& > svg:first-child": {
          marginRight: 2,
        },
        "& > svg:last-child": {
          marginLeft: 2,
        },
        textTransform: "none",
        boxShadow: "none",
      },
      containedPrimary: {
        "&:hover": {
          boxShadow: "none",
        },
      },
      containedSecondary: {
        "&:hover": {
          boxShadow: "none",
        },
      },
      textSizeSmall: {
        fontWeight: "bold",
        fontSize: "0.875rem",
        paddingTop: 0,
        paddingBottom: 0,

        ":hover": {
          backgroundColor: "transparent",
          color: theme.palette.primary.dark,
        },
      },
      startIcon: {
        "&$iconSizeSmall": {
          marginRight: 4,
        },
        "&$endIcon": {
          marginLeft: 4,
        },
      },
    },
  },
  MuiButtonBase: {
    defaultProps: {
      // The props to apply
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
    styleOverrides: {
      root: {
        alignItems: "flex-start",
        justifyContent: "flex-start",
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      adornedStart: {
        "> svg:first-of-type": {
          margin: "0 0.5rem",
        },
      },
    },
  },
  MuiInput: {
    defaultProps: {
      disableUnderline: true,
    },
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.grey[100],
        border: "1px solid",
        borderColor: theme.palette.divider,
        borderRadius: (theme.shape.borderRadius as number) * 2,
        padding: "0 6px",
        minHeight: 48,
      },
      focused: {
        outline: "3px solid #333333",
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: (theme.shape.borderRadius as number) * 1.5,
      },
    },
  },
  MuiCheckbox: {
    defaultProps: {
      checkedIcon: <Icon name="checkboxActive" size={20} />,
      icon: <Icon name="checkboxDefault" size={20} />,
    },
    styleOverrides: {
      root: {
        padding: 4,
        color: "primary.main",
      },
      disabled: {
        color: "grey.500",
        "&$checked": {
          color: "primary.disabled",
        },
      },
      checked: {},

      // "> *": {
      //   fill:
      //     color && checked
      //       ? color
      //       : checked && !disabled
      //       ? "primary.main"
      //       : checked && disabled
      //       ? "primary.disabled"
      //       : "grey.500",
    },
  },
  MuiCssBaseline: {
    styleOverrides: {
      margin: 0,
      padding: 0,
      fontFamily: theme.typography.fontFamily,
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
      fallbacks: [
        [
          {
            fontFamily: "FrutigerNeue",
            fontDisplay: "swap",
            fontStyle: "normal",
            fontWeight: 700,
            src: `local('Frutiger LT Com') url("/static/fonts/FrutigerNeueW02-Bd.woff2") format("woff")`,
          },
          {
            fontFamily: "FrutigerNeue",
            fontDisplay: "swap",
            fontStyle: "normal",
            fontWeight: 400,
            src: `local('Frutiger LT Com') url("/static/fonts/FrutigerNeueW02-Regular.woff2") format("woff")`,
          },
          {
            fontFamily: "FrutigerNeue",
            fontDisplay: "swap",
            fontStyle: "normal",
            fontWeight: 300,
            src: `local('Frutiger LT Com') url("/static/fonts/FrutigerNeueW02-Light.woff2") format("woff")`,
          },
          {
            fontFamily: "FrutigerNeue",
            fontDisplay: "swap",
            fontStyle: "italic",
            fontWeight: 400,
            src: `local('Frutiger LT Com') url("/static/fonts/FrutigerNeueW02-It.woff2") format("woff")`,
          },
        ].map((x) => ({ "@font-face": x })),
      ],
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
  "/static/fonts/FrutigerNeueW02-It.woff2",
];
