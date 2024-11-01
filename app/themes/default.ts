import { createTheme } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";
import { preloadFonts, theme } from "@/themes/federal";
import { theme as darkTheme } from "@/themes/federal-dark";

const customTheme = createTheme(baseTheme, theme);
const customDarkTheme = createTheme(baseTheme, darkTheme);

const themeModule = {
  theme: customTheme,
  dark: customDarkTheme,
  preloadFonts,
};

export default themeModule;
