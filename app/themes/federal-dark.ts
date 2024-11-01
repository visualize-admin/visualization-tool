import { createTheme } from "@mui/material/styles";

/**
 * Theme conforming to the Swiss Federal CD guidelines
 */
export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      light: "#003347",
      main: "#0088cc",
      hover: "#00a3f5",
      active: "#33b5ff",
      disabled: "#1a4d66",
    },
    divider: "#2e2e2e",
    action: {
      hover: "#1a1a1a",
    },
    secondary: {
      main: "#9e9e9e",
      hover: "#b0b0b0",
      active: "#cccccc",
      disabled: "#666666",
    },
    success: {
      main: "#4caf50",
      light: "#1b3b1e",
      hover: "#66bb6a",
      active: "#81c784",
      disabled: "#2d4731",
    },
    muted: {
      main: "#1e1e1e",
      colored: "#1a1a1a",
      dark: "#141414",
    },
    brand: {
      main: "#ff1a1a",
    },
    hint: {
      main: "#9e9e9e",
    },
    alert: {
      main: "#f44336",
      light: "#311b1b",
    },
    warning: {
      main: "#ffc107",
      light: "#332b15",
    },
    info: {
      main: "#2196f3",
      light: "#1a2a33",
    },
    error: {
      main: "#f44336",
      light: "#331b1b",
    },
    organization: {
      main: "#0088cc",
      light: "#003347", // matches primaryLight
    },
    category: {
      main: "#4caf50",
      light: "#1b3b1e", // matches successLight
    },
    grey: {
      100: "#000000",
      200: "#1a1a1a",
      300: "#2e2e2e",
      400: "#424242",
      500: "#757575",
      600: "#9e9e9e",
      700: "#bdbdbd",
      800: "#e0e0e0",
      900: "#ffffff",
    },
  },
});
