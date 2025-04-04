import { c } from "@interactivethings/swiss-federal-ci";
import { Components } from "@mui/material";

import { Icon } from "@/icons";
import {
  CheckboxCheckedIcon,
  CheckboxIcon,
  CheckboxIndeterminateIcon,
} from "@/themes/custom-icons";
import { palette } from "@/themes/palette";
import { shadows } from "@/themes/shadows";
import { typography } from "@/themes/typography";

export const components: Components = {
  MuiAlert: {
    defaultProps: {
      icon: false,
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const color = ownerState.color ?? "blue";

        return {
          display: "flex",
          alignItems: "center",
          padding: "16px 40px",
          backgroundColor: palette[color][50],
          color: palette[color].main,
          boxShadow: shadows[2],

          "& .MuiIconButton-root:hover": {
            backgroundColor: palette[color][100],
          },
        };
      },
      // @ts-ignore
      message: {
        width: "100%",
        ...typography.body3,
      },
      icon: {
        padding: 0,
      },
    },
  },
  MuiButtonBase: {
    defaultProps: {
      disableRipple: true,
    },
    styleOverrides: {
      // @ts-ignore
      root: {
        textTransform: "none !important",

        "& .MuiButton-startIcon": {
          marginRight: 4,
        },

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
                padding: 0,

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
          minWidth: 0,
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
  MuiCheckbox: {
    defaultProps: {
      icon: <CheckboxIcon />,
      indeterminateIcon: <CheckboxIndeterminateIcon />,
      checkedIcon: <CheckboxCheckedIcon />,
    },
    styleOverrides: {
      root: {
        padding: 0,
        borderRadius: 0,
        color: palette.monochrome[500],

        "&:hover": {
          backgroundColor: "transparent",
        },

        "&.Mui-checked": {
          color: palette.monochrome[800],
        },

        "&.Mui-disabled": {
          opacity: 0.25,
        },
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: c.monochrome[400],
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        display: "flex",
        gap: 12,
        width: "fit-content",
        margin: 0,
      },
      label: {
        lineHeight: "1 !important",
        color: palette.text.primary,

        "&.Mui-disabled": {
          color: palette.monochrome[400],
        },
      },
    },
  },
  MuiLink: {
    defaultProps: {
      underline: "none",
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        "&:hover": {
          backgroundColor: palette.cobalt[50],
        },
      },
    },
  },
  MuiInput: {
    defaultProps: {
      size: "md",
      disableUnderline: true,
    },
    styleOverrides: {
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
          display: "flex",
          alignItems: "center",
          width: "100%",
          borderRadius: 2,
          border: `1px solid ${palette.monochrome[300]}`,
          backgroundColor: "#fff",
          color: "inherit",

          "&:hover": {
            color: "inherit",
          },

          "&.Mui-focused": {
            border: `1px solid ${palette.monochrome[500]}`,
          },
        };
      },
      input: {
        padding: 0,
        paddingRight: 12,

        "&.Mui-disabled": {
          "-webkit-text-fill-color": palette.monochrome[300],
        },

        "&::placeholder": {
          opacity: 1,
        },
      },
    },
  },
  MuiList: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      // @ts-ignore
      root: {
        padding: "10px 16px",
        color: palette.monochrome[500],
        ...typography.body3,
        transition: "background-color 0.2s ease",

        "&:hover": {
          backgroundColor: palette.cobalt[50],
        },
      },
    },
  },
  MuiListSubheader: {
    defaultProps: {
      disableGutters: true,
    },
    styleOverrides: {
      root: {
        padding: 12,
        color: palette.text.primary,
        lineHeight: 1,
        fontWeight: 700,
        ...typography.h6,
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 4,
        boxShadow: shadows[4],
      },
    },
  },
  MuiNativeSelect: {
    defaultProps: {
      IconComponent: ({ style, ...rest }: any) => {
        return (
          <Icon
            name="chevronDown"
            style={{
              ...style,
              cursor: "pointer",
              color: "white",
            }}
            {...rest}
          />
        );
      },
    },
    styleOverrides: {
      select: {
        transition: "color 0.2s ease",
      },
      icon: {
        top: "calc(50% - 12px)",
        right: 0,
        color: "inherit !important",
        transition: "color 0.2s ease !important",
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      size: "md",
      notched: false,
      IconComponent: ({ style, ...rest }: any) => {
        return (
          <Icon
            name="chevronDown"
            style={{
              ...style,
              cursor: "pointer",
              color: palette.monochrome[800],
              transition: "transform 0.2s ease",
            }}
            {...rest}
          />
        );
      },
    },
    styleOverrides: {
      root: ({ ownerState }) => {
        const variant = ownerState.variant ?? "outlined";
        const variantStyles = (() => {
          switch (variant) {
            case "outlined":
              return {};
            case "filled":
              return {};
            case "standard": {
              return {
                backgroundColor: "transparent",

                "&.Mui-focused": {
                  backgroundColor: `none !important`,
                },
              };
            }
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        const size = ownerState.size ?? "md";
        const sizeStyles = (() => {
          switch (size) {
            case "sm":
              return { ...typography.h6 };
            case "md":
              return { ...typography.h5 };
            case "lg":
              return { ...typography.h4 };
            case "xl":
              return { ...typography.h4 };
            default:
              const _exhaustiveCheck: never = size;
              return _exhaustiveCheck;
          }
        })();

        return {
          cursor: "pointer",
          flex: 1,
          display: "flex",
          alignItems: "center",
          maxWidth: "100%",
          gap: 4,
          padding: 0,
          border: "none !important",
          ...variantStyles,

          "& fieldset": {
            display: "none",
          },

          "& .MuiSelect-select": {
            ...sizeStyles,
          },

          "&.Mui-disabled": {
            color: `${palette.monochrome[300]} !important`,
          },
        };
      },
      select: ({ ownerState }) => {
        const variant = ownerState.variant ?? "outlined";
        const variantStyles = (() => {
          switch (variant) {
            case "outlined":
              return {
                padding: "10px 40px 10px 20px !important",
                border: `1px solid ${palette.monochrome[300]}`,

                "&:hover, &[aria-expanded='true']": {
                  border: `1px solid ${palette.monochrome[500]}`,
                  backgroundColor: palette.cobalt[50],
                },
              };
            case "filled":
              return {
                padding: "10px 40px 10px 20px !important",
              };
            case "standard": {
              return {
                padding: "4px 24px 4px 4px !important",

                "&:hover, &[aria-expanded='true']": {
                  backgroundColor: palette.cobalt[50],
                },
              };
            }
            default:
              const _exhaustiveCheck: never = variant;
              return _exhaustiveCheck;
          }
        })();

        return {
          ...variantStyles,
          backgroundColor: "transparent",
          transition:
            "border 0.2s ease, background-color 0.2s ease, color 0.2s ease",
        };
      },
      icon: ({ ownerState }) => {
        const variant = ownerState.variant ?? "outlined";

        return {
          top: "calc(50% - 12px)",
          right: variant === "standard" ? 0 : 12,
          color: "inherit !important",
          transition: "color 0.2s ease, transform 0.2s ease !important",
        };
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: {
        display: "flex",
        width: 32,
        height: 16,
        padding: 0,

        "&:hover": {
          "& .MuiSwitch-switchBase": {
            backgroundColor: "transparent",
          },
        },
      },
      switchBase: {
        padding: 2,

        "&.Mui-checked": {
          transform: "translateX(16px)",

          "& + .MuiSwitch-track": {
            backgroundColor: palette.monochrome[800],
            opacity: 1,
          },
        },
      },
      thumb: {
        width: 12,
        height: 12,
        padding: 0,
        backgroundColor: "white",
        boxShadow: shadows[2],
      },
      track: {
        borderRadius: 12,
        backgroundColor: palette.monochrome[300],
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      // @ts-ignore
      root: {
        padding: "16px 24px",
        color: palette.monochrome[600],
        whiteSpace: "nowrap",
        maxWidth: "unset !important",
        ...typography.body3,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        display: "contents",

        "& .MuiTableCell-root": {
          backgroundColor: palette.cobalt[50],
        },
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        border: `1px solid ${palette.monochrome[300]}`,
      },
    },
  },
  MuiTreeItem: {
    styleOverrides: {
      content: {
        color: palette.monochrome[600],
        transition: "background-color 0.2s ease",

        "&:hover": {
          backgroundColor: palette.cobalt[50],
          color: palette.monochrome[800],
        },

        "&.Mui-expanded, &.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused":
          {
            backgroundColor: "transparent",
            color: palette.monochrome[800],

            "&:hover": {
              backgroundColor: palette.cobalt[50],
            },
          },

        "&.Mui-expanded .MuiTreeItem-iconContainer": {
          transform: "rotate(90deg)",
        },
      },
      label: {
        display: "flex",
        alignItems: "center",
        padding: "10px 16px",
        paddingLeft: 4,
      },
      iconContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: 24,
        height: 24,
        margin: 0,
        transition: "transform 0.2s ease, opacity 0.2s ease",
      },
    },
  },
  MuiTreeView: {
    defaultProps: {
      defaultCollapseIcon: (
        <Icon
          name="chevronRight"
          style={{
            fontSize: 24,
          }}
        />
      ),
      defaultExpandIcon: (
        <Icon
          name="chevronRight"
          style={{
            fontSize: 24,
          }}
        />
      ),
    },
    styleOverrides: {
      root: {
        overflowY: "auto",
        flexGrow: 1,
        padding: "4px 0",
        userSelect: "none",
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
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
