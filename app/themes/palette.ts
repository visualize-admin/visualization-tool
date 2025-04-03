import { c as colors } from "@interactivethings/swiss-federal-ci";
import { type ThemeOptions } from "@mui/material";

export const palette = {
  text: {
    primary: colors.monochrome[800],
  },
  primary: {
    main: "#1D4ED8",
    light: "#60A5FA",
    contrastText: "#FFFFFF",
  },
  warning: {
    main: "#9A3412",
    light: "#FFF7ED",
  },
  cobalt: {
    main: colors.cobalt[700],
    ...colors.cobalt,
  },
  monochrome: {
    main: colors.monochrome[700],
    ...colors.monochrome,
  },
  red: {
    main: colors.red[700],
    ...colors.red,
  },
  green: {
    main: "#047857",
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    500: "#10B981",
    600: "#059669",
    700: "#047857",
    800: "#065F46",
    900: "#064E3B",
  },
  blue: {
    main: "#1D4ED8",
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A",
  },
} satisfies ThemeOptions["palette"];
