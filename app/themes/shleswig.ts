import { createTheme } from "@mui/material";

/**
 * Theme conforming to the Schleswig-Holstein guidelines
 */
export const theme = createTheme({
  palette: {
    primary: {
      light: "#B7CDE3",
      main: "#003064",
      hover: "#D4004B",
      active: "#D4004B",
      disabled: "#B4BAC0",
    },
    divider: "#E3E5ED",
    action: {
      hover: "#EDEEF2",
    },
    secondary: {
      main: "#003064",
      hover: "#D4004B",
      active: "#D4004B",
      disabled: "#B4BAC0",
    },
    success: {
      main: "#157A6D",
      light: "#DFF0D8",
      hover: "#157A6D",
      active: "#157A6D",
      disabled: "#B4BAC0",
    },
    muted: {
      main: "#EDEEF2",
      colored: "#F4F5F7",
      dark: "#F2F7F9",
    },
    brand: {
      main: "#DC0018",
    },
    hint: {
      main: "#64768F",
    },
    alert: {
      main: "#DC0018",
      light: "#FFE6E1",
    },
    warning: {
      main: "#8F845F",
      light: "#FCF0B4",
    },
    info: {
      main: "#3A78B8",
      light: "#C4D6E7",
    },
    error: {
      main: "#96205E",
      light: "#EEDBE8",
    },
    organization: {
      main: "#001E49",
      light: "#C4D6E7",
    },
    category: {
      main: "#001E49",
      light: "#DFF0D8",
    },
    grey: {
      100: "#FFFFFF",
      200: "#F4F5F7",
      300: "#EDEEF2",
      400: "#E3E5ED",
      500: "#B4BAC0",
      600: "#64768F",
      700: "#525E71",
      800: "#2F3947",
      900: "#212529",
    },
  },
});
