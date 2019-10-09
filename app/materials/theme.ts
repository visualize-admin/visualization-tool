export const theme = {
  breakpoints: ["48em", "62em", "75em"],
  space: [0, "0.25rem", "0.5rem", "0.75rem", "1rem", "1.5rem", "2rem", "4rem"],
  colors: {
    // ch: {
    //   red: "#F7001D",
    //   venetianRed: "#DC0018"
    // },
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
      disabled: "#3c763d"
    },
    muted: "#f6f6f9",
    error: "#FF5555",
    hint: "#006699"
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
    circle: 99999
  },
  shadows: {
    card: "0 0 4px rgba(0, 0, 0, .125)"
  },
  // rebass variants
  // radio: {
  //   size: 42,
  //   // height: 12,
  //   bg: "steelblue",
  //   color: "magenta"
  // },

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
        bg: "success.disabled"
      }
    },
    outline: {
      variant: "buttons.primary",
      color: "primary.base",
      bg: "transparent",
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
        bg: "secondary.disabled"
      }
    }
  },
  variants: {
    hint: {
      width: "100%",
      height: "100%",
      maxHeight: "10rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: [5, 6, 6],
      borderWidth: "2px",
      borderStyle: "solid",
      borderColor: "hint",
      color: "hint"
    },
    error: {
      variant: "variants.hint",
      color: "error",
      borderColor: "error"
    },
    loading: {
      variant: "variants.hint"
    }
  }
  // styles: {
  //   root: {
  //     fontFamily: "body",
  //     fontWeight: "body",
  //     lineHeight: 1.5,
  //   }
  // }
};
