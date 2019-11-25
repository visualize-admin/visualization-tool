/**
 * IMPORTANT: just export JSON-serializable data from this file!
 *
 * It will be loaded in _app.tsx's `getInitialProps()`, which will serialize to JSON.
 * So references to other modules, functions etc. won't work here.
 *
 * - `globalStyles` should be a plain string (NOT a Emotion `css` template string).
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
    "4rem"
  ],
  colors: {
    ch: {
      red: "#F7001D",
      venetianRed: "#DC0018"
    },
    monochrome: {
      "100": "#FFFFFF",
      "200": "#F5F5F5",
      "300": "#E5E5E5",
      "400": "#D5D5D5",
      "500": "#CCCCCC",
      "600": "#757575",
      "700": "#454545",
      "800": "#333333",
      "900": "#000000"
    },
    bafu: {
      chardonnay: "#F9C16E",
      sun: "#F38B3C",
      stTropaz: "#375172",
      lightBlue: "#62A8E5",
      summerSky: "#32B8DF",
      darkCyan: "#008F85",
      silverTree: "#6ECD9C",
      olivine: "#93B479",
      redDamask: "#C97146",
      taupe: "#8D5A54"
    },

    primary: {
      base: "#006699",
      hover: "#004B70",
      active: "#00334D",
      disabled: "#599cbd"
    },
    secondary: {
      base: "#757575",
      hover: "#616161",
      active: "#454545",
      disabled: "#a6a6a6"
    },
    success: {
      base: "#3c763d",
      hover: "#3c763d",
      active: "#3c763d",
      disabled: "#DFF0D8",
      light: "#DFF0D8"
    },
    muted: "#F5F5F5",
    blueGrey: "#F9FAFB",
    blueGreyDarker: "#F2F7F9",
    focus: "#333333",
    error: "#FF5555",
    hint: "#757575",
    missing: "#EFEFEF"
  },
  fonts: {
    frutigerLight:
      "FrutigerNeueLight, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;",
    frutigerRegular:
      "FrutigerNeueRegular, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;",
    frutigerBold:
      "FrutigerNeueBold, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;",
    monospace: "Menlo, monospace"
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
    "5.5rem"
  ],
  fontWeights: {
    light: 300,
    regular: 400,
    heading: 700,
    bold: 700
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
    "4.5rem"
  ],
  sizes: {
    avatar: 48
  },
  radii: {
    default: 3,
    bigger: 4,
    circle: 99999
  },
  shadows: {
    primary: "0 3px 5px 0 rgba(0,0,0,0.10)",
    rightSide: "0 2px 4px -2px rgba(0, 0, 0, .1)",
    leftSide: "-2px 2px 4px -2px rgba(0, 0, 0, .1)"
  },
  text: {
    giga: {
      fontFamily: "frutigerLight",
      lineHeight: [9, 10, 10],
      fontWeight: "light",
      fontSize: [8, 9, 9]
    },
    heading1: {
      fontFamily: "frutigerBold",
      lineHeight: [7, 8, 8],
      fontWeight: "bold",
      fontSize: [6, 7, 7]
    },
    heading2: {
      fontFamily: "frutigerRegular",
      lineHeight: [6, 7, 7],
      fontWeight: "regular",
      fontSize: [5, 6, 6]
    },
    heading3: {
      fontFamily: "frutigerBold",
      lineHeight: [5, 6, 6],
      fontWeight: "bold",
      fontSize: [4, 5, 5]
    },
    lead: {
      fontFamily: "frutigerBold",
      lineHeight: [4, 5, 5],
      fontWeight: "bold",
      fontSize: [3, 4, 4]
    },
    paragraph1: {
      fontFamily: "frutigerRegular",
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4]
    },
    paragraph2: {
      fontFamily: "frutigerRegular",
      lineHeight: [2, 4, 3],
      fontWeight: "regular",
      fontSize: [2, 3, 3]
    },
    table: {
      fontFamily: "frutigerRegular",
      lineHeight: [2, 4, 4],
      fontWeight: "regular",
      fontSize: [2, 3, 3]
    },
    meta: {
      fontFamily: "frutigerRegular",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2]
    }
  },

  buttons: {
    primary: {
      bg: "primary.base",
      color: "monochrome.100",
      borderRadius: "default",
      width: "100%",
      minWidth: 160,
      maxWidth: 300,
      p: 3,
      fontFamily: "frutigerRegular",
      fontSize: [3, 3, 3],
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "primary.hover"
      },
      ":active": {
        bg: "primary.hover"
      },
      ":disabled": {
        cursor: "initial",
        bg: "primary.disabled"
      }
    },
    success: {
      variant: "buttons.primary",
      bg: "success.base",
      ":hover": {
        bg: "success.hover"
      },
      ":active": {
        bg: "success.hover"
      },
      ":disabled": {
        cursor: "initial",
        bg: "success.disabled"
      }
    },
    outline: {
      variant: "buttons.primary",
      color: "primary.base",
      bg: "monochrome.100",
      border: "1px",
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "primary.base",
      ":hover": {
        bg: "muted"
      },
      ":active": {
        bg: "muted"
      },
      ":disabled": {
        cursor: "initial",
        bg: "muted"
      }
    },
    secondary: {
      variant: "buttons.primary",
      bg: "secondary.base",
      ":hover": {
        bg: "secondary.hover"
      },
      ":active": {
        bg: "secondary.hover"
      },
      ":disabled": {
        cursor: "initial",
        bg: "secondary.disabled"
      }
    },
    datasetButton: {
      normal: {
        bg: "transparent",
        position: "relative",
        color: "monochrome.700",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        py: 4,
        borderRadius: 0,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome.300",
        "&:first-of-type": {
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome.300"
        },
        ":hover": {
          bg: "blueGreyDarker"
        },
        ":active": {
          bg: "blueGreyDarker"
        }
      },
      selected: {
        variant: "buttons.datasetButton.normal",
        bg: "blueGreyDarker"
      }
    },
    step: {
      bg: "transparent",
      appearance: "none",
      width: "156px",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    },
    palette: {
      variant: "buttons.primary",
      color: "monochrome.700",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      bg: "monochrome.100",
      p: 1,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "monochrome.500",
      ":hover": {
        bg: "monochrome.100"
      },
      ":active": {
        bg: "monochrome.100"
      },
      ":disabled": {
        cursor: "initial",
        bg: "muted"
      }
    },
    control: {
      color: "monochrome.700",
      borderColor: "primary.base",
      borderRadius: "default",
      width: "100%",
      minWidth: 160,
      maxWidth: 300,
      my: "2px",
      px: 2,
      py: 3,
      fontFamily: "frutigerRegular",
      fontSize: [3, 3, 3],
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "blueGreyDarker"
      },
      ":active": {
        bg: "blueGreyDarker"
      },
      ":disabled": {
        cursor: "initial",
        bg: "muted"
      }
    }
  },
  // All variants except ^ buttons ^
  variants: {
    header: {
      root: {
        px: [0, 4, 4],
        pt: [0, 3, 3],
        pb: [0, 5, 5],
        borderBottomWidth: "4px",
        borderBottomStyle: "solid",
        borderBottomColor: "ch.venetianRed",
        color: "monochrome.700",
        flexDirection: ["column", "row"]
      },
      logo: {
        order: [2, 1],
        alignItems: ["center", "flex-start"],
        "& > h1": {
          pl: [0, 6]
        }
      },
      logoImgMobile: {
        display: ["block", "none"],
        mx: 4,
        my: 4,
        width: 24
      },
      logoImgDesktop: {
        display: ["none", "block"],
        pr: 7,
        width: 448,
        borderRightWidth: "1px",
        borderRightStyle: "solid",
        borderRightColor: "monochrome.300"
      },
      languageList: {
        listStyle: "none",
        pr: 2,
        py: 2,
        width: "100%",
        bg: ["monochrome.300", "transparent"],
        order: [1, 2],
        justifyContent: "flex-end"
      },
      languageListItem: { mr: 2 },
      languageLink: {
        p: 1,
        textTransform: "uppercase",
        textDecoration: "none",
        color: "monochrome.700"
      }
    },

    stepper: {
      root: {
        position: "relative",
        pt: 2,
        bg: "monochrome.100",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome.500",
        overflow: "hidden"
      },
      line: {
        position: "absolute",
        width: "calc(100% - 156px)", // Remove: 2 * buttons.step.width / 2
        height: "24px",
        mt: 2,
        transform: "translateY(-50%)",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome.300",
        zIndex: 3
      }
    },
    step: {
      basic: {
        width: "24px",
        height: "24px",
        mb: 1,
        borderRadius: "circle",
        fontSize: 4
      },
      past: {
        variant: "variants.step.basic",
        bg: "monochrome.800"
      },
      current: {
        variant: "variants.step.basic",
        bg: "ch.venetianRed"
      },
      future: {
        variant: "variants.step.basic",
        bg: "monochrome.600"
      }
    },
    container: {
      root: {
        overflow: "scroll"
      },
      left: {
        bg: "monochrome.100",
        variant: "variants.container.root",
        boxShadow: "rightSide",
        borderRightColor: "monochrome.500",
        borderRightWidth: "1px",
        borderRightStyle: "solid",
        gridArea: "left"
      },
      middle: {
        variant: "variants.container.root",
        p: 4,
        gridArea: "middle"
      },
      chart: {
        variant: "variants.container.root",
        bg: "monochrome.100",
        boxShadow: "primary",
        width: "100%",
        minHeight: 600,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome.300"
      },
      right: {
        bg: "blueGrey",
        variant: "variants.container.root",
        boxShadow: "leftSide",
        borderLeftColor: "monochrome.500",
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        gridArea: "right"
      },
      header: {
        p: 3,
        bg: "monochrome.100",
        borderBottomColor: "monochrome.500",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid"
      }
    },
    actionBar: { my: 5 },
    label: {
      color: "monochrome.700",
      fontSize: [4, 4, 4],
      pb: 0
    },
    labelSmaller: {
      fontSize: [2, 2, 2],
      pb: 1
    },
    controlSection: {
      pb: 2,
      borderTopColor: "monochrome.500",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      "&:first-of-type": {
        borderTopWidth: 0
      }
    },
    controlSectionTitle: {
      p: 3,
      bg: "transparent",
      appearance: "none",
      width: "100%",
      border: "none",
      cursor: "pointer"
    },
    controlSectionContent: {
      px: 3
    },
    chartTypeRadio: {
      width: "86px",
      height: "86px",
      mx: 4,
      my: 6,
      transition: "all .2s",
      borderRadius: "bigger"
    },

    hint: {
      width: "100%",
      height: "100%",
      color: "hint",
      textAlign: "center"
    },
    error: {
      variant: "variants.hint",
      color: "error",
      borderColor: "error"
    },
    loading: {
      variant: "variants.hint"
    },
    success: {
      variant: "variants.hint",
      mb: 4,
      p: 4,
      color: "success.base",
      bg: "success.light",
      height: "auto"
    },
    palette: {
      menu: {
        p: 1,
        bg: "monochrome.100"
      },
      row: { bg: "monochrome.100" },
      color: {
        display: "inline-block",
        margin: 0,
        padding: 0,
        width: 16,
        height: 36,
        borderColor: "white",
        borderWidth: "1px",
        borderStyle: "solid",
        "&:first-of-type": {
          borderTopLeftRadius: "bigger",
          borderBottomLeftRadius: "bigger"
        },
        "&:last-of-type": {
          borderTopRightRadius: "bigger",
          borderBottomRightRadius: "bigger"
        }
      }
    },
    datatable: {
      headerRow: {
        fontFamily: "frutigerBold",
        fontSize: [3],
        verticalAlign: "baseline",
        color: "monochrome.700",
        borderBottomColor: "monochrome.700",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid"
      },
      headerCell: { px: 2, py: 3, minWidth: 128 },
      row: {
        fontFamily: "frutigerLight",
        fontSize: [3],
        color: "monochrome.800",
        borderBottomColor: "monochrome.400",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid"
      },
      cell: { px: 2, py: 3, minWidth: 128 }
    }
  }
};

/**
 * Global styles to load font files or similar things
 */
export const globalStyles = `
  @font-face {
    font-family: "FrutigerNeueBold";
    font-style: normal;
    font-weight: 700;
    src: url("/static/fonts/FrutigerNeueW02-Bd.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Bd.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueRegular";
    font-style: normal;
    font-weight: 400;
    src: url("/static/fonts/FrutigerNeueW02-Regular.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Regular.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueLight";
    font-style: normal;
    font-weight: 300;
    src: url("/static/fonts/FrutigerNeueW02-Light.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Light.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeueItalic";
    font-style: italic;
    font-weight: 400;
    src: url("/static/fonts/FrutigerNeueW02-It.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-It.woff") format("woff");
  }
  body {
    margin: 0;
    padding: 0;
    font-family: FrutigerNeueRegular, -apple-system, BlinkMacSystemFont,
    Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji,
    Segoe UI Symbol;
    svg {
      display: block;
    }

  }

  *:focus {
    outline: 4px solid #333333;
  }

  fieldset {
    border: 0;
    padding: 0.01em 0 0 0;
    margin: 0;
    min-width: 0;
  }
`;
