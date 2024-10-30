import { createTheme } from "@mui/material";

import { makeComponents, preloadFonts, theme } from "@/themes/federal";
import { theme as shleswigTheme } from "@/themes/shleswig";

const customTheme = createTheme(theme, shleswigTheme);

customTheme.components = makeComponents(customTheme);

const themeModule = {
  theme: customTheme,
  preloadFonts,
};

export default themeModule;
