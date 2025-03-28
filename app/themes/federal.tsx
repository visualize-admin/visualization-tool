import {
  b as breakpoints,
  e as shadows,
  s as spacing,
} from "@interactivethings/swiss-federal-ci";
import { createTheme } from "@mui/material/styles";
import { Shadows } from "@mui/material/styles/shadows";

import { components } from "@/themes/components";
import { palette } from "@/themes/palette";
import { typography } from "@/themes/typography";

export const theme = createTheme({
  palette,
  breakpoints,
  spacing, // 4
  shape: {
    borderRadius: 2,
  },
  // swiss-federal-ci's design system only defines 7 shadows, while MUI expects 25.
  // As we won't be using all 25 shadows, we can simply pass the shadows from swiss-federal-ci.
  shadows: shadows as Shadows,
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
