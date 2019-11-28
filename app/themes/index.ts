import { useTheme as useEmotionTheme } from "emotion-theming";

type StyleValueMap = {
  [k: string]: string | number | (string | number)[] | StyleValueMap;
};

/**
 * Adapted from the [System UI Theme Specification](https://system-ui.com/theme/)
 *
 * TODO: improve typing to be less generic and more specific to the theme configs that *we* use.
 */
export interface Theme {
  colors: StyleValueMap;
  space: string[] | number[];
  breakpoints: string[];
  fontSizes: string[];
  fonts: Record<string, string>;
  fontWeights: Record<string, number>;
  lineHeights: string[];

  // Rebass component theme keys
  variants: StyleValueMap;
  text: StyleValueMap;
  buttons: StyleValueMap;
  sizes: StyleValueMap;
  radii: StyleValueMap;
  shadows: StyleValueMap;
}

interface ThemeModule {
  theme: Theme;
  globalStyles?: string;
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

export const useTheme = () => useEmotionTheme<Theme>();
