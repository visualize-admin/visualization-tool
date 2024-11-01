import { createTheme } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";
import { preloadFonts, theme as sfTheme } from "@/themes/federal";
import { theme as sfDarkTheme } from "@/themes/federal-dark";

const swissFederalTheme = createTheme(baseTheme, sfTheme);
const swissFederalThemeDark = createTheme(baseTheme, sfTheme, sfDarkTheme);

const themeModule = {
  themes: {
    base: baseTheme,
    light: swissFederalTheme,
    dark: swissFederalThemeDark,
  },
  preloadFonts,
};

export default themeModule;
