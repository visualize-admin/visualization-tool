import { createTheme } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";
import { preloadFonts, theme as sfTheme } from "@/themes/federal";
import { theme as sfDarkTheme } from "@/themes/federal-dark";
import { theme as shTheme } from "@/themes/shleswig";

const swissFederalTheme = createTheme(baseTheme, sfTheme);
const shleswigTheme = createTheme(baseTheme, shTheme);
const swissFederalThemeDark = createTheme(baseTheme, sfTheme, sfDarkTheme);

const themeModule = {
  themes: {
    base: baseTheme,
    light: swissFederalTheme,
    dark: swissFederalThemeDark,
    shleswig: shleswigTheme,
  },
  preloadFonts,
};

export default themeModule;
