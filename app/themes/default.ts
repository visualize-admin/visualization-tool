import { createTheme } from "@mui/material";

import { makeComponents, preloadFonts, theme } from "@/themes/federal";

const customTheme = createTheme(theme, {
  palette: {
    primary: {
      light: "#FFCCCC", // light red
      main: "#FF0000", // red
      hover: "#CC0000", // dark red
      active: "#990000", // darker red
      disabled: "#FF6666", // muted red
    },
    divider: "#E5E5E5",
    action: {
      hover: "#F2F7F9",
    },
    secondary: {
      main: "#008000", // green
      hover: "#006400", // dark green
      active: "#004d00", // darker green
      disabled: "#66b266", // muted green
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
      main: "#FF0000", // red
    },
    hint: {
      main: "#008000", // green
    },
    alert: {
      main: "#FF0000", // red
      light: "#FFCCCC", // light red
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
      main: "#008000", // green
      light: "#90EE90", // light green
    },
    category: {
      main: "#FF0000", // red
      light: "#FFCCCC", // light red
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
});

console.log(customTheme.palette.primary);

customTheme.components = makeComponents(customTheme);

const themeModule = {
  theme: customTheme,
  preloadFonts,
};

export default themeModule;
