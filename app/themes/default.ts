import { createTheme } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";
import { preloadFonts, theme } from "@/themes/federal";

const customTheme = createTheme(baseTheme, theme);

const themeModule = {
  theme: customTheme,
  preloadFonts,
};

export default themeModule;
