import { createTheme } from "@mui/material";

import { theme as baseTheme } from "@/themes/base";
import { preloadFonts } from "@/themes/federal";

const customTheme = createTheme(baseTheme);

const themeModule = {
  theme: customTheme,
  preloadFonts,
};

export default themeModule;
