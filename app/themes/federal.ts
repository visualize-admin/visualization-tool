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
    "4rem",
    "4.5rem"
  ],
  colors: {
    text: "monochrome900",
    background: "monochrome100",

    brand: "#DC0018", // Venetian Red
    monochrome100: "#FFFFFF",
    monochrome200: "#F5F5F5",
    monochrome300: "#E5E5E5",
    monochrome400: "#D5D5D5",
    monochrome500: "#CCCCCC",
    monochrome600: "#757575",
    monochrome700: "#454545",
    monochrome800: "#333333",
    monochrome900: "#000000",

    // bafu: {
    //   chardonnay: "#F9C16E",
    //   sun: "#F38B3C",
    //   stTropaz: "#375172",
    //   lightBlue: "#62A8E5",
    //   summerSky: "#32B8DF",
    //   darkCyan: "#008F85",
    //   silverTree: "#6ECD9C",
    //   olivine: "#93B479",
    //   redDamask: "#C97146",
    //   taupe: "#8D5A54"
    // },

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
    blueGrey: "#F9FAFB",
    blueGreyDarker: "#F2F7F9",
    focus: "#333333",
    error: "#FF5555",
    hint: "#757575",
    missing: "#EFEFEF"
  },
  fonts: {
    body:
      "FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol",
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
    rightSide: "2px 0 4px 0 rgba(0,0,0,0.05)",
    leftSide: "-2px 0 2px 0 rgba(0,0,0,0.05)"
  },
  text: {
    giga: {
      fontFamily: "body",
      lineHeight: [9, 10, 10],
      fontWeight: "light",
      fontSize: [8, 9, 9]
    },
    heading1: {
      fontFamily: "body",
      lineHeight: [7, 8, 8],
      fontWeight: "bold",
      fontSize: [6, 7, 7]
    },
    heading2: {
      fontFamily: "body",
      lineHeight: [6, 7, 7],
      fontWeight: "regular",
      fontSize: [5, 6, 6]
    },
    heading3: {
      fontFamily: "body",
      lineHeight: [5, 6, 6],
      fontWeight: "bold",
      fontSize: [4, 5, 5]
    },
    lead: {
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "bold",
      fontSize: [3, 4, 4]
    },
    paragraph1: {
      fontFamily: "body",
      lineHeight: [4, 5, 5],
      fontWeight: "regular",
      fontSize: [3, 4, 4]
    },
    paragraph2: {
      fontFamily: "body",
      lineHeight: [2, 4, 3],
      fontWeight: "regular",
      fontSize: [2, 3, 3]
    },
    table: {
      fontFamily: "body",
      lineHeight: [2, 4, 4],
      fontWeight: "regular",
      fontSize: [2, 3, 3]
    },
    meta: {
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2]
    },
    // Custom
    toolTitle: {
      fontFamily: "body",
      lineHeight: 1.2,
      fontWeight: "bold",
      fontSize: [8, "3.5rem", "3.5rem"],
      mb: [4]
    },
    homepageSection: {
      fontFamily: "body",
      lineHeight: [7, 8, 8],
      fontWeight: "light",
      fontSize: [6, 7, 7],
      color: "monochrome800",
      mb: 6,
      textAlign: "center"
    },
    homepageTutorialStep: {
      fontSize: 5,
      fontFamily: "body",
      mt: 4,
      mb: 2
    },
    homepageExampleHeadline: {
      fontSize: [5, 5, 6],
      lineHeight: 1.5,
      fontFamily: "body",
      mb: [2, 2, 4]
    },
    homepageExampleDescription: {
      fontSize: 4,
      lineHeight: 1.5,
      fontFamily: "body",
      mt: 4,
      mb: [2, 2, 0]
    },
    homepageContribute: {
      fontSize: [6, 6, 7],
      lineHeight: 1.25,
      fontFamily: "body",
      mb: 3
    }
  },
  buttons: {
    primary: {
      bg: "primary",
      color: "monochrome100",
      borderRadius: "default",
      width: ["100%", "auto"],
      minWidth: "160px",
      px: 7,
      py: 3,
      fontFamily: "body",
      fontSize: 4,
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "primaryHover"
      },
      ":active": {
        bg: "primaryHover"
      },
      ":disabled": {
        cursor: "initial",
        bg: "primaryDisabled"
      }
    },
    success: {
      variant: "buttons.primary",
      bg: "successBase",
      ":hover": {
        bg: "successHover"
      },
      ":active": {
        bg: "successHover"
      },
      ":disabled": {
        cursor: "initial",
        bg: "successDisabled"
      }
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
      bg: "secondary",
      ":hover": {
        bg: "secondaryHover"
      },
      ":active": {
        bg: "secondaryHover"
      },
      ":disabled": {
        cursor: "initial",
        bg: "secondaryDisabled"
      }
    },
    inverted: {
      bg: "monochrome100",
      color: "monochrome800",
      borderRadius: "default",
      width: ["100%", "auto"],
      minWidth: 160,
      px: 7,
      py: 3,
      fontFamily: "body",
      fontSize: 4,
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        bg: "monochrome300"
      },
      ":active": {
        bg: "monochrome400"
      },
      ":disabled": {
        cursor: "initial",
        color: "monochrome600",
        bg: "monochrome300"
      }
    },
    datasetButton: {
      normal: {
        bg: "transparent",
        position: "relative",
        color: "monochrome700",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
        py: 4,
        borderRadius: 0,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome300",
        "&:first-of-type": {
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "monochrome300"
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
      width: ["100%"],
      color: "monochrome700",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      bg: "monochrome100",
      p: 1,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "monochrome500",
      ":hover": {
        bg: "monochrome100"
      },
      ":active": {
        bg: "monochrome100"
      },
      ":disabled": {
        cursor: "initial",
        bg: "muted"
      }
    },
    control: {
      color: "monochrome700",
      borderColor: "primary",
      borderRadius: "default",
      width: "100%",
      minWidth: 160,
      maxWidth: 300,
      my: "2px",
      px: 2,
      py: 3,
      fontFamily: "body",
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
    },
    publishAction: {
      display: "flex",
      alignItems: "center",
      color: "primary",
      bg: "transparent",
      border: "none",
      borderRadius: "default",
      mr: 4,
      mt: [2, 4],
      pr: 2,
      pl: 0,
      py: [2, 3],
      fontFamily: "body",
      fontSize: [3, 3, 3],
      transition: "background-color .2s",
      cursor: "pointer",
      ":hover": {
        color: "primaryHover"
      },
      ":active": {
        color: "primaryActive"
      },
      ":disabled": {
        cursor: "initial",
        color: "primaryDisabled"
      }
    },
    iconButton: {
      background: "transparent",
      color: "monochrome600",
      bg: "monochrome200",
      border: "none",
      cursor: "pointer",
      ":hover": {
        bg: "monochrome300",
        color: "monochrome700"
      },
      ":active": {
        bg: "monochrome400",
        color: "monochrome800"
      },
      ":disabled": {
        cursor: "initial",
        color: "monochrome300"
      }
    },
    chartTypeRadio: {
      width: "86px",
      height: "86px",
      mx: 4,
      my: 6,
      transition: "all .2s",
      borderRadius: "default"
    },
    linkButton: {
      background: "transparent",
      color: "monochrome700",
      border: "none",
      cursor: "pointer",
      mb: 4,
      p: 0,
      ":disabled": {
        cursor: "initial",
        color: "monochrome300"
      }
    },
    downloadButton: {
      background: "transparent",
      color: "primary",
      textAlign: "left",
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      border: "none",
      cursor: "pointer",
      mt: 2,
      p: 0,
      ":disabled": {
        cursor: "initial",
        color: "monochrome300"
      }
    }
  },
  links: {
    iconLink: {
      ml: 4,
      color: "primary",
      "&:disabled": {
        color: "primaryDisabled"
      },
      "&:hover": {
        color: "primaryHover"
      },
      "&:active": {
        color: "primaryActive"
      },
      "&:visited": {
        color: "primary"
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
        borderBottomColor: "brand",
        color: "monochrome700",
        flexDirection: ["column", "row"],
        // Needs to be "fixed" to prevent
        // iOS full-page scrolling
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        bg: "monochrome100",
        overflowY: "hidden",
        zIndex: 13
      },
      content: {
        px: [0, 4, 4],
        pt: [0, 3, 3],
        pb: [0, 5, 5],
        borderBottomWidth: "4px",
        borderBottomStyle: "solid",
        borderBottomColor: "brand",
        color: "monochrome700",
        flexDirection: ["column", "row"]
      },
      logo: {
        order: [2, 1],
        alignItems: ["center", "flex-start"],
        cursor: "pointer",
        textDecoration: "none",
        "& > h1": {
          pl: [0, 6],
          textDecoration: "none",
          color: "monochrome700"
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
        pr: 6,
        borderRightWidth: "1px",
        borderRightStyle: "solid",
        borderRightColor: "monochrome300"
      },
      languageList: {
        listStyle: "none",
        p: [2, 0],
        ml: [0, "auto"],
        width: ["100%", "auto"],
        // flexGrow: 1,
        bg: ["monochrome300", "transparent"],
        order: [1, 2],
        justifyContent: "flex-end"
      },
      languageListItem: { ml: 1, p: 0 },
      languageLink: {
        normal: {
          variant: "text.paragraph2",
          fontSize: 3,
          lineHeight: 3,
          p: 1,
          textTransform: "uppercase",
          textDecoration: "none",
          color: "monochrome700",
          bg: "transparent"
        },
        active: {
          variant: "variants.header.languageLink.normal",
          bg: ["monochrome500", "monochrome300"]
        }
      }
    },

    stepper: {
      root: {
        position: "relative",
        pt: 2,
        bg: "monochrome100",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
        borderBottomColor: "monochrome500",
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
        borderBottomColor: "monochrome300",
        zIndex: 3
      }
    },
    step: {
      basic: {
        width: "24px",
        height: "24px",
        mb: 1,
        borderRadius: "circle",
        fontSize: 3,
        fontFamily: "body"
      },
      past: {
        variant: "variants.step.basic",
        bg: "monochrome800"
      },
      current: {
        variant: "variants.step.basic",
        bg: "brand"
      },
      future: {
        variant: "variants.step.basic",
        bg: "monochrome600"
      }
    },
    container: {
      root: {
        overflowX: "hidden",
        overflowY: "auto"
      },
      left: {
        bg: "monochrome100",
        variant: "variants.container.root",
        boxShadow: "rightSide",
        borderRightColor: "monochrome500",
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
        bg: "monochrome100",
        boxShadow: "primary",
        width: "auto",
        minHeight: [50, 100, 500],
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome300"
      },
      right: {
        bg: "blueGrey",
        variant: "variants.container.root",
        boxShadow: "leftSide",
        borderLeftColor: "monochrome500",
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        gridArea: "right"
      }
    },
    actionBar: { my: 5 },
    label: {
      color: "monochrome700",
      fontSize: [4, 4, 4],
      pb: 0
    },
    labelSmaller: {
      fontSize: [2, 2, 2],
      pb: 1
    },
    controlSection: {
      borderTopColor: "monochrome500",
      borderTopWidth: "1px",
      borderTopStyle: "solid",
      "&:first-of-type": {
        borderTopWidth: 0
      }
    },
    controlSectionTitle: {
      variant: "text.table",
      fontWeight: "bold",
      p: 4,
      bg: "transparent",
      appearance: "none",
      width: "100%",
      border: "none"
    },
    leftControlSectionContent: {
      px: 2,
      pb: 4
    },
    rightControlSectionContent: {
      px: 4,
      pb: 4
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
      width: "auto",
      mb: 4,
      p: 4,
      color: "successBase",
      bg: "successLight",
      height: "auto"
    },
    info: {
      variant: "variants.hint",
      width: "auto",
      mb: 4,
      mx: 6,
      p: 4,
      color: "primary",
      bg: "primaryLight",
      height: "auto"
    },
    palette: {
      menu: {
        bg: "monochrome100"
      },
      row: { bg: "monochrome100" },
      color: {
        display: "inline-block",
        margin: 0,
        padding: 0,
        width: 16,
        height: 24,
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
        fontFamily: "body",
        fontSize: [3],
        verticalAlign: "baseline",
        color: "monochrome700",
        borderBottomColor: "monochrome700",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid"
      },
      headerCell: { px: 2, py: 3, minWidth: 128 },
      row: {
        fontFamily: "body",
        fontSize: [3],
        color: "monochrome800",
        borderBottomColor: "monochrome400",
        borderBottomWidth: "1px",
        borderBottomStyle: "solid"
      },
      cell: { px: 2, py: 3, minWidth: 128 }
    },

    publishActionOverlay: {
      zIndex: 10,
      display: ["block", "none"],
      bg: "monochrome900",
      opacity: 0.25,
      width: "100vw",
      height: "100vh",
      position: "fixed",
      top: 0,
      left: 0,
      pointerEvents: "none"
    },
    publishActionModal: {
      position: "fixed",
      bottom: 4,
      left: 4,
      right: 4,
      zIndex: 12,
      py: 2,
      px: 4,
      bg: "monochrome100",
      boxShadow: "primary",
      borderRadius: "default",

      "@media screen and (min-width: 62em)": {
        mt: 2,
        bottom: "unset",
        left: "unset",
        right: "unset",
        position: "absolute",
        minWidth: 340,
        // maxWidth: 340,
        borderWidth: "1px",
        borderStyle: "solid",
        borderColor: "monochrome500"
      }
    },
    iFrameCode: {
      color: "monochrome700",
      fontSize: 4,
      minWidth: 160,
      overflowX: "scroll",
      borderRadius: 0,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "monochrome500"
    },
    fieldSetLegend: {
      fontFamily: "body",
      lineHeight: [1, 2, 2],
      fontWeight: "regular",
      fontSize: [1, 2, 2],
      mb: 1,
      color: "monochrome600"
    },
    footer: {
      institution: {
        width: ["100%", "auto"],
        px: 4,
        py: 5,
        color: ["monochrome900", "monochrome700"]
      },
      logo: {
        width: "100vw",
        display: ["block", "none"],
        px: 4,
        py: 5,
        borderTopWidth: "1px",
        borderBottomWidth: "1px",
        borderTopStyle: "solid",
        borderBottomStyle: "solid",
        borderTopColor: "monochrome500",
        borderBottomColor: "monochrome500"
      },
      link: {
        width: ["100%", "auto"],
        px: [4, 5],
        py: [3, 4],
        color: "primary",
        fontSize: 3,
        fontFamily: "body",
        cursor: "pointer",
        ":hover": {
          color: "primaryHover"
        },
        ":active": {
          color: "primaryHover"
        },
        ":disabled": {
          cursor: "initial",
          color: "primaryDisabled"
        }
      },
      linkBottom: {
        px: [4, 5],
        py: [3, 4],
        color: "primary",
        fontSize: 3,
        fontFamily: "body",
        borderLeftWidth: ["1px", 0],
        borderLeftStyle: "solid",
        borderLeftColor: "monochrome500",
        cursor: "pointer",
        ":hover": {
          color: "primaryHover"
        },
        ":active": {
          color: "primaryHover"
        },
        ":disabled": {
          cursor: "initial",
          color: "primaryDisabled"
        }
      }
    },
    dataSetMetadata: {
      title: {
        fontFamily: "body",
        lineHeight: [1, 2, 2],
        fontWeight: "regular",
        fontSize: [1, 2, 2],
        color: "monochrome600"
      },
      body: {
        fontFamily: "body",
        lineHeight: [4, 5, 5],
        fontWeight: "regular",
        fontSize: [3, 4, 4],
        color: "monochrome900",
        mb: 3
      }
    }
  }
};

/**
 * Global styles to load font files or similar things
 */
export const globalStyles = `
  @font-face {
    font-family: "FrutigerNeue";
    font-style: normal;
    font-weight: 700;
    src: url("/static/fonts/FrutigerNeueW02-Bd.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Bd.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeue";
    font-style: normal;
    font-weight: 400;
    src: url("/static/fonts/FrutigerNeueW02-Regular.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Regular.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeue";
    font-style: normal;
    font-weight: 300;
    src: url("/static/fonts/FrutigerNeueW02-Light.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-Light.woff") format("woff");
  }
  @font-face {
    font-family: "FrutigerNeue";
    font-style: italic;
    font-weight: 400;
    src: url("/static/fonts/FrutigerNeueW02-It.woff2") format("woff2"),
      url("/static/fonts/FrutigerNeueW02-It.woff") format("woff");
  }
  body {
    margin: 0;
    padding: 0;
    font-family: FrutigerNeue, -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol;
    svg {
      display: block;
    }

    // Use momentum-based scrolling on iOS devices
    -webkit-overflow-scrolling: touch;

    // Auto-hide scrollbars in Edge
    -ms-overflow-style: -ms-autohiding-scrollbar;

  }

  *:focus {
    outline: 3px solid #333333;
  }

  fieldset {
    border: 0;
    padding: 0.01em 0 0 0;
    margin: 0;
    min-width: 0;
  }
`;
