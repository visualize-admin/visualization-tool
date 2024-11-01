import { createTheme } from "@mui/material";

import { preloadFonts, theme } from "@/themes/base";
import { theme as shleswigTheme } from "@/themes/shleswig";

const customTheme = createTheme(theme, shleswigTheme);

const themeModule = {
  theme: customTheme,
  preloadFonts,
};

export default themeModule;
