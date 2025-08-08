import {
  b as breakpoints,
  s as spacing,
} from "@interactivethings/swiss-federal-ci";
import { createTheme } from "@mui/material/styles";

import { components } from "@/themes/components";
import { palette } from "@/themes/palette";
import { shadows } from "@/themes/shadows";
import { typography } from "@/themes/typography";

export const theme = createTheme({
  palette,
  breakpoints,
  spacing, // 4
  shape: {
    borderRadius: 4,
  },
  shadows,
  typography,
  components,
});

/**
 * Load these fonts early using <link rel="preload" />
 * Use WOFF2 fonts if possible!
 */
export const preloadFonts = [
  "/static/fonts/NotoSans-Light.woff2",
  "/static/fonts/NotoSans-LightItalic.woff2",
  "/static/fonts/NotoSans-Regular.woff2",
  "/static/fonts/NotoSans-Italic.woff2",
  "/static/fonts/NotoSans-Bold.woff2",
  "/static/fonts/NotoSans-BoldItalic.woff2",
];
