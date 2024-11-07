import { createTheme } from "@mui/material";
import merge from "lodash/merge";

import { theme as baseTheme, themeOptions as baseOptions } from "@/themes/base";
import { preloadFonts as sfFonts, theme as sfTheme } from "@/themes/federal";
import { theme as sfDarkTheme } from "@/themes/federal-dark";
import { preloadFonts as shFonts, theme as shTheme } from "@/themes/schleswig";

const schleswigOptions = merge({ ...baseOptions }, shTheme);
const shleswigTheme = createTheme(schleswigOptions);
shleswigTheme.logos = {
  mobile: "/images/schleswig-xs.svg",
  desktop: "/images/schleswig-md.svg",
};

const swissFederalOptions = merge({ ...baseOptions }, sfTheme);
const swissFederalTheme = createTheme(swissFederalOptions);
swissFederalTheme.logos = {
  mobile: "/images/federal-xs.svg",
  desktop: "/images/federal-md.svg",
};

const swissFederalDarkOptions = createTheme(
  merge(swissFederalOptions, sfDarkTheme)
);
const swissFederalThemeDark = createTheme(swissFederalDarkOptions);
swissFederalThemeDark.logos = {
  mobile: "/images/federal-dark-xs.svg",
  desktop: "/images/federal-dark-md.svg",
};

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
