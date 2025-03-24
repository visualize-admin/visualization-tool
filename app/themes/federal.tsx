import { alertClasses, Fade, Grow, sliderClasses } from "@mui/material";
import { Breakpoint, createTheme, Theme } from "@mui/material/styles";
import merge from "lodash/merge";
import omit from "lodash/omit";

import { Icon } from "@/icons";
import shadows from "@/themes/shadows";

const isSafari15 =
  typeof navigator !== "undefined" && navigator.vendor?.indexOf("Apple") >= 0
    ? navigator.userAgent
        .match(/Version[/\s]([\d]+)/g)?.[0]
        ?.split("/")?.[1] === "15"
    : false;

const breakpoints = ["xs", "md"] as Breakpoint[];

const createTypographyVariant = (theme: Theme, spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${spec.lineHeight[i]}px`;
    const fontSize = `${spec.fontSize[i]}px`;
    res[theme.breakpoints.up(breakpoints[i])] = {
      fontSize,
      lineHeight,
    };
  }
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
    divider: "#E5E5E5",
    action: {
      hover: "#F2F7F9",
    },
    secondary: {
      main: "#757575",
      hover: "#616161",
      active: "#4F4F4F",
      disabled: "#A5A5A5",
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
      light: "#FCF0B4",
    },
    info: {
      main: "#31708f",
      light: "#d9edf7",
    },
    error: {
      main: "#a82824",
      light: "#f2dede",
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
    values: { xs: 0, sm: 768, md: 992, lg: 1280, xl: 1360 },
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 64, 72],
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
    fontWeight: 500,
  }),
  h3: createTypographyVariant(theme, {
    fontSize: [16, 18],
    lineHeight: [24, 28],
    fontWeight: "bold",
  }),
  h4: createTypographyVariant(theme, {
    fontSize: [14, 16],
    lineHeight: [22, 24],
    fontWeight: "bold",
  }),
  h5: createTypographyVariant(theme, {
    fontSize: [14],
    lineHeight: [20],
    fontWeight: "bold",
  }),
  h6: createTypographyVariant(theme, {
    fontSize: [12],
    lineHeight: [18],
    fontWeight: "bold",
  }),
  body1: createTypographyVariant(theme, {
    fontSize: [14, 16],
    lineHeight: [22, 24],
    fontWeight: "normal",
  }),
  body2: createTypographyVariant(theme, {
    fontSize: [12, 14],
    lineHeight: [18, 20],
    fontWeight: "normal",
  }),
  caption: createTypographyVariant(theme, {
    fontSize: [12],
    lineHeight: [18],
    fontWeight: "normal",
  }),
});

const makeStandardAlertVariant = ({
  severity,
}: {
  severity: "info" | "warning" | "success" | "error";
}) => ({
  "&": {
    backgroundColor: theme.palette[severity].light,
  },
  [`& > .${alertClasses.message}`]: {
    color: theme.palette.text.primary,
  },
  [`& > .${alertClasses.icon}`]: {
    color: theme.palette[severity].main,
  },
});

theme.components = {
  MuiAccordion: {
    defaultProps: {
      disableGutters: true,
    },
    styleOverrides: {
      root: {
        boxShadow: "none !important",
        "&::before": {
          display: "none",
        },
      },
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },
  MuiAccordionSummary: {
    defaultProps: {
      expandIcon: <Icon name="chevronDown" />,
    },
    styleOverrides: {
      root: {
        alignItems: "center",
        padding: 0,
      },
    },
  },
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
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        display: "-webkit-box",
        overflow: "hidden",
        fontSize: "0.875rem",
      },
      sizeSmall: {
        fontSize: "0.75rem",
      },
    },
  },
  MuiTreeItem: {
    styleOverrides: {
      content: {
        minHeight: "32px",
      },
      label: {
        fontSize: theme.typography.body2.fontSize,

        [theme.breakpoints.up("md")]: {
          fontSize: theme.typography.body2.fontSize,
        },
      },
    },
  },
  MuiButton: {
    variants: [
      {
        props: { size: "small" },
        style: {
          fontSize: 14,
          minHeight: 32,
          minWidth: "auto",
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
      {
        props: { variant: "inverted" },
        style: {
          backgroundColor: theme.palette.primary.contrastText,
          color: theme.palette.primary.main,
          ":hover": {
            backgroundColor: theme.palette.grey[300],
          },
          ":active": {
            bg: theme.palette.grey[400],
          },
          ":disabled": {
            cursor: "initial",
            color: theme.palette.grey[600],
            bg: theme.palette.grey[300],
          },
        },
      },
    ],
    defaultProps: {
      variant: "contained",
      color: "primary",
    },
    styleOverrides: {
      sizeXsmall: {
        height: "24px",
        minWidth: "auto",
        padding: "0 8px",
        fontSize: "12px",
      },
      sizeSmall: {
        ".MuiButton-startIcon": {
          marginRight: 4,
        },
        ".MuiButton-endIcon": {
          marginLeft: 4,
        },
      },
      sizeMedium: {
        fontSize: 14,
        lineHeight: "20px",
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
        transition: "background-color .2s, transform 0.1s ease",
        cursor: "pointer",
        display: "inline-flex",
        flexGrow: 0,

        "&:active": {
          transform: "scale(0.98)",
        },

        "& > svg": {
          width: 22,
          marginTop: -1,
          marginBottom: -1,
        },
        "& > svg:first-of-type": {
          marginRight: 2,
        },
        "& > svg:last-of-type": {
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
        fontSize: "0.875rem",
        paddingTop: 0,
        paddingBottom: 0,

        ":hover": {
          backgroundColor: "transparent",
          color: theme.palette.primary.dark,
        },
        "& svg": {
          width: 16,
          height: 16,
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
  MuiDialog: {
    styleOverrides: {
      root: "",
    },
  },
  MuiDialogContent: {
    styleOverrides: {
      root: {
        padding: "30px",
        paddingBottom: "16px",
      },
    },
  },
  MuiDialogTitle: {
    defaultProps: {
      // @ts-ignore
      variant: "h4",
    },
    styleOverrides: {
      root: {
        padding: "30px",
        paddingBottom: "16px",

        "&&": {
          lineHeight: "1.5",
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
        minWidth: "auto",
        "& .MuiListItemIcon-root.MuiListItemIcon-root": {
          minWidth: "24px",
        },
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        minWidth: 18,
        height: 18,
        padding: [0, 3],
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        backgroundColor: theme.palette.background.paper,
      },
      input: {
        "&:focus": {
          backgroundColor: "transparent",
        },
      },
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
        "&.Mui-focused": {
          borderColor: theme.palette.secondary.main,
        },
      },
      sizeSmall: {
        minHeight: 40,
        fontSize: `${theme.typography.body2.fontSize} !important`,
        lineHeight: `${theme.typography.body2.lineHeight} !important`,
      },
      input: {
        padding: 0,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        fontSize: theme.typography.body2.fontSize,
        lineHeight: theme.typography.body2.lineHeight,
        borderRadius: (theme.shape.borderRadius as number) * 1.5,

        "& > .MuiOutlinedInput-input": {
          paddingLeft: 12,
        },
      },
    },
  },
  MuiAlertTitle: {
    styleOverrides: {
      root: {
        fontWeight: "bold",
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        "& > .MuiAlert-message": {
          justifyContent: "center",
          display: "flex",
          flexDirection: "column",
          fontSize: `1rem`,
        },
      },
      standardSuccess: makeStandardAlertVariant({
        severity: "success",
      }),
      standardError: makeStandardAlertVariant({ severity: "error" }),
      standardWarning: makeStandardAlertVariant({ severity: "warning" }),
      standardInfo: makeStandardAlertVariant({ severity: "info" }),
    },
  },
  MuiCheckbox: {
    defaultProps: {
      checkedIcon: <Icon name="checkboxActive" size={20} />,
      indeterminateIcon: <Icon name="checkboxIndeterminate" size={20} />,
      icon: <Icon name="checkboxDefault" size={20} />,
    },
    styleOverrides: {
      root: {
        padding: 0,
        margin: 0,
      },
      disabled: {
        color: "grey.500",
        "&$checked": {
          color: "primary.disabled",
        },
      },
      checked: {},
    },
  },
  MuiCalendarPicker: {
    styleOverrides: {
      root: {
        maxHeight: "330px",
        "& > :nth-child(2) > div > :nth-child(2)": {
          minHeight: 230,
        },
      },
    },
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        width: "100%",
      },
    },
  },
  MuiFormControlLabel: {
    styleOverrides: {
      root: {
        marginLeft: 0,
        gap: "0.375rem",
      },
    },
  },
  MuiPickersDay: {
    styleOverrides: {
      root: {
        justifyContent: "center",
        alignItems: "center",
      },
      selected: {
        color: "white",
        "&.Mui-disabled": {
          color: "rgba(255, 255, 255, 0.5)",
        },
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        fontSize: "0.875rem",
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        verticalAlign: "baseline",
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        fontSize: theme.typography.body2.fontSize,
        filter: `drop-shadow(0 2px 8px rgba(0, 0, 0, 0.25))`,
        zIndex: 1,
        position: "relative",
        padding: theme.spacing(4),
      },
      arrow: {
        color: theme.palette.background.paper,
      },
    },
  },
  MuiNativeSelect: {
    styleOverrides: {
      root: {
        paddingTop: "0.25rem",
      },
      outlined: {
        paddingLeft: "0.5rem",
      },
    },
  },
  MuiRadio: {
    styleOverrides: {
      root: {
        padding: 0,
      },
    },
  },
  MuiSelect: {
    defaultProps: {
      IconComponent: (props) => (
        <span
          {...props}
          style={{
            ...props.style,
            width: 16,
            height: 16,
            right: 12,
            transition: "transform 0.15s ease",
          }}
        >
          <Icon
            name="chevronDown"
            size={16}
            style={{ transform: "scale(1.5)" }}
          />
        </span>
      ),
    },
    styleOverrides: {
      select: {
        display: "flex",
        alignItems: "center",
        boxSizing: "border-box",
        height: "40px",
        padding: "8px 12px",
        textOverflow: "ellipsis",
        fontSize: theme.typography.body2.fontSize,

        "&.MuiInputBase-inputSizeSmall": {
          height: "auto",
          minHeight: 0,
          paddingLeft: 0,
        },
      },
      disabled: {
        color: theme.palette.grey[500],
      },
    },
  },
  MuiSlider: {
    styleOverrides: {
      root: {
        height: 3,

        [`& .${sliderClasses.rail}`]: {
          backgroundColor: theme.palette.grey[300],
        },
        [`& .${sliderClasses.thumb}`]: {
          width: 20,
          height: 20,

          "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
            boxShadow: "inherit",
          },
          "&:before": {
            display: "none",
          },
        },
        [`& .${sliderClasses.valueLabel}`]: {
          background: theme.palette.background.paper,
          color: theme.palette.primary.main,

          boxShadow: "0 0 30px 0 rgba(0, 0, 0, 0.34)",
        },
        [`& .${sliderClasses.mark}`]: {
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: theme.palette.grey[600],

          [`&.${sliderClasses.markActive}`]: {
            background: "#66AFE9",
          },
        },
      },
    },
  },
  MuiSwitch: {
    styleOverrides: {
      root: ({ ownerState }) => ({
        display: "flex",
        ...(ownerState.size === "small" && {
          width: 24,
          height: 12,
        }),
        ...(ownerState.size === "medium" && {
          width: 28,
          height: 16,
        }),
        padding: 0,

        "& .MuiSwitch-switchBase": {
          padding: 2,
          "&.Mui-checked": {
            transform: "translateX(12px)",
            color: "#fff",
            "& + .MuiSwitch-track": {
              opacity: 1,
              backgroundColor: theme.palette.primary.main,
              border: 0,
            },
            ".MuiSwitch-thumb": {
              opacity: 1,
            },
          },
        },
        "& .MuiSwitch-thumb": {
          backgroundColor: theme.palette.background.paper,
          ...(ownerState.size === "small" && {
            width: 8,
            height: 8,
          }),
          ...(ownerState.size === "medium" && {
            width: 12,
            height: 12,
          }),
          borderRadius: 6,
          transition: theme.transitions.create(["width"], {
            duration: 200,
          }),
        },
        "& .MuiSwitch-track": {
          borderRadius: 16 / 2,
          opacity: 1,
          backgroundColor: theme.palette.secondary.active,
          border: `1px solid ${theme.palette.divider}`,
          boxSizing: "border-box",
        },
        "&:active": {
          "& .MuiSwitch-thumb": {
            width: 15,
          },
          "& .MuiSwitch-switchBase.Mui-checked": {
            transform: "translateX(9px)",
          },
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
        minWidth: 128,
        borderBottomWidth: "1px",
        borderBottomStyle: "solid",
      },
      body: {
        color: "grey.800",
        fontWeight: "normal",
        borderBottomColor: theme.palette.grey[400],
      },
      head: {
        color: "grey.700",
        fontweight: "bold",
        borderBottomColor: theme.palette.grey[700],
      },
    },
  },
  MuiListSubheader: {
    styleOverrides: {
      root: {
        color: theme.palette.grey[900],
        fontWeight: "bold",
        lineHeight: 1.5,
        borderBottom: "1px solid",
        borderBottomColor: theme.palette.divider,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
      },
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        "& svg": {
          width: 16,
          height: 16,
        },
      },
    },
  },
  MuiCircularProgress: {
    defaultProps: {
      size: 16,
    },
  },
  MuiPopover: {
    defaultProps: {
      TransitionComponent: isSafari15 ? Fade : Grow,
    },
    styleOverrides: {
      root: {
        "& .MuiPaper-root": {
          borderRadius: 8,
          boxShadow: "0px 10px 30px 0px rgba(0, 0, 0, 0.34)",
        },
        "& .MuiMenuItem-root": {
          fontSize: theme.typography.body2.fontSize,
        },
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      flexContainer: {
        height: 60,
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        paddingTop: 0,
        paddingRight: 24,
        paddingBottom: 0,
        paddingLeft: 24,
        color: theme.palette.grey[700],

        "&.Mui-selected": {
          color: theme.palette.primary.main,
        },
      },
    },
  },
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
          font-family: "FrutigerNeue";
          font-display: swap;
          font-style: normal;
          font-weight: 700;
          src: url("/static/fonts/FrutigerNeueW02-Bd.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "FrutigerNeue";
          font-display: swap;
          font-style: normal;
          font-weight: 400;
          src: url("/static/fonts/FrutigerNeueW02-Regular.woff2") format("woff2");
        }
  
        @font-face {
          font-family: "FrutigerNeue";
          font-display: swap;
          font-style: normal;
          font-weight: 300;
          src: url("/static/fonts/FrutigerNeueW02-Light.woff2") format("woff2");
        }
        
        @font-face {
          font-family: "FrutigerNeue";
          font-display: swap;
          font-style: italic;
          font-weight: 400;
          src: url("/static/fonts/FrutigerNeueW02-It.woff2") format("woff2");
        }
        `,
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
