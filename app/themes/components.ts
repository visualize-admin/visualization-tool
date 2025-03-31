import { c } from "@interactivethings/swiss-federal-ci";
import { Components } from "@mui/material";

import { palette } from "@/themes/palette";
import { shadows } from "@/themes/shadows";
import { typography } from "@/themes/typography";

export const components: Components = {
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      // @ts-ignore
      root: {
        textTransform: "none !important",
        "& .MuiButton-endIcon": {
          marginLeft: 4,
        },
      },
    },
  },
  MuiButton: {
    defaultProps: {
      variant: "contained",
      color: "cobalt",
      size: "md",
    },
    styleOverrides: {
      // @ts-ignore
      root: ({ ownerState }) => {
        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return { padding: "10px 16px", ...typography.h6 };
            case "md":
              return { padding: "10px 20px", ...typography.h5 };
            case "lg":
              return { padding: "10px 20px", ...typography.h4 };
            case "xl":
              return { padding: "10px 20px", ...typography.h3 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        const variant = ownerState.variant ?? "contained";
        const color =
          ownerState.color === "inherit"
            ? "inherit"
            : palette[ownerState.color ?? "cobalt"];

        const variantColorStyles = (() => {
          if (!color) {
            return {};
          }

          if (color === "inherit") {
            return {
              color: "inherit",
            };
          }

          switch (variant) {
            case "contained":
              return {
                backgroundColor: color[400],
                color: "#fff",
                "&:hover": {
                  backgroundColor: color[600],
                },
              };
            case "outlined":
              return {
                color: color[500],
                borderColor: color[500],
                "&:hover": {
                  borderColor: color[500],
                  backgroundColor: color[50],
                },
              };
            case "text":
              return {
                color: color[700],
                "&:hover": {
                  backgroundColor: "transparent",
                  color: color[900],
                },
              };
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
          ...variantColorStyles,
        };
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 3,
    },
    styleOverrides: {
      root: {
        width: "100%",
        borderRadius: 4,
        lineHeight: 0,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: c.monochrome[300],
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: "none",
    },
  },
  MuiInput: {
    defaultProps: {
      size: "md",
      disableUnderline: true,
    },
    styleOverrides: {
      // @ts-ignore
      root: ({ ownerState }) => {
        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return { padding: "10px 16px", ...typography.h6 };
            case "md":
              return { padding: "10px 16px", ...typography.h5 };
            case "lg":
              return { padding: "10px 16px", ...typography.h4 };
            case "xl":
              return { padding: "12px 16px", ...typography.h4 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...sizeStyles,
          width: "100%",
          borderRadius: 2,
          border: `1px solid ${palette.monochrome[300]}`,
          backgroundColor: "#fff",

          "&.Mui-focused": {
            border: `1px solid ${palette.monochrome[500]}`,
          },
        };
      },
      input: {
        padding: 0,
        paddingRight: 12,

        "&::placeholder": {
          opacity: 1,
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      // @ts-ignore
      tooltip: {
        width: "100%",
        maxWidth: 280,
        padding: "12px 16px",
        backgroundColor: "#fff",
        color: palette.text.primary,
        boxShadow: shadows[3],
        ...typography.caption,
      },
      arrow: {
        color: "#fff",
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: {
        fontWeight: 400,
      },
    },
  },
  MuiCssBaseline: {
    styleOverrides: `
        html {
          margin: 0;
          padding: 0;
          font-family: "NotoSans";
          -webkit-overflow-scrolling: touch;
          -ms-overflow-style: -ms-autohiding-scrollbar;
        }

        * {
          line-height: 1;
        }

        fieldset {
          border: none;
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 300;
          src: url("/static/fonts/NotoSans-Light.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 300;
          src: url("/static/fonts/NotoSans-LightItalic.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 400;
          src: url("/static/fonts/NotoSans-Regular.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 400;
          src: url("/static/fonts/NotoSans-Italic.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: normal;
          font-weight: 700;
          src: url("/static/fonts/NotoSans-Bold.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "NotoSans";
          font-display: swap;
          font-style: italic;
          font-weight: 700;
          src: url("/static/fonts/NotoSans-BoldItalic.woff2") format("woff2");
        }
        `,
  },
};
