import { Theme, useTheme } from "@mui/material";
export interface ThemeModule {
  theme: Theme;
  preloadFonts?: string[];
}

export const loadTheme = async (theme: string = "federal") => {
  let themeModule: ThemeModule;
  try {
    themeModule = await import(`../themes/${theme}`);
  } catch (e) {
    // If there's an error, the theme was probably not found
    console.warn(`Theme '${theme}' not found. Using 'federal' theme`);
    themeModule = await import("../themes/federal");
  }
  return themeModule;
};

export { useTheme };
