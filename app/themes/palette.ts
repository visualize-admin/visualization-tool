import { c as colors } from "@interactivethings/swiss-federal-ci";
import { type ThemeOptions } from "@mui/material";
import { PaletteOptions } from "@mui/material/styles";

const blue: PaletteOptions["blue"] = {
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
};

const orange: PaletteOptions["orange"] = {
  main: "#9A3412",
  50: "#FFF7ED",
  100: "#FFEDD5",
  200: "#FED7AA",
  300: "#FDBA74",
  400: "#FB923C",
  500: "#F97316",
  600: "#EA580C",
  700: "#C2410C",
  800: "#9A3412",
  900: "#7C2D12",
};

const green: PaletteOptions["green"] = {
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
};

export const palette = {
  primary: {
    main: blue[700],
    dark: blue[900],
    contrastText: "#fff",
  },
  secondary: {
    main: colors.cobalt[400],
    dark: colors.cobalt[600],
    contrastText: "#fff",
  },
  text: {
    primary: colors.monochrome[800],
    secondary: colors.monochrome[500],
  },
  divider: colors.cobalt[100],
  success: colors.success,
  error: colors.error,
  warning: {
    main: orange[800],
    // contrastText in Bund Library
    light: orange[50],
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
  orange,
  yellow: {
    main: "#92400E",
    50: "#FFFBEB",
    100: "#FEF3C7",
    200: "#FDE68A",
    300: "#FCD34D",
    400: "#FBBF24",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    800: "#92400E",
    900: "#78350F",
  },
  green,
  blue,
} satisfies ThemeOptions["palette"];
