import { ThemeOptions } from "@mui/material";

export const palette: ThemeOptions["palette"] = {
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
};
