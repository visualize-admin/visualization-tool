import { createTheme } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";
import { preloadFonts as sfFonts, theme as sfTheme } from "@/themes/federal";
import { theme as sfDarkTheme } from "@/themes/federal-dark";
import { preloadFonts as shFonts, theme as shTheme } from "@/themes/shleswig";

const swissFederalTheme = createTheme(baseTheme, sfTheme);
const shleswigTheme = createTheme(baseTheme, shTheme);
const swissFederalThemeDark = createTheme(baseTheme, sfTheme, sfDarkTheme);

const themeModule = {
  themes: {
    shleswig: shleswigTheme,
    base: baseTheme,
    light: swissFederalTheme,
    dark: swissFederalThemeDark,
  },
  preloadFonts: [...sfFonts, ...shFonts],
};

export default themeModule;
