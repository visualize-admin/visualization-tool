import { useThemeUI, Theme as ThemeUITheme } from "theme-ui";
import { SystemStyleObject } from "@styled-system/css";

type StyleValueMap = {
  [k: string]: string | number | (string | number)[] | StyleValueMap;
};

/**
 * Adapted/refined from the [Theme UI Theme Specification](https://theme-ui.com/theme-spec)
 *
 * TODO: Types are still a bit wonky because the base types are not the greatest
 */
export type Theme = Omit<
  ThemeUITheme,
  "colors" | "buttons" | "links" | "fontSizes" | "lineHeights" | "fonts"
> &
  Required<Pick<ThemeUITheme, "space" | "breakpoints">> & {
    fontSizes: Array<string | number>;
    lineHeights: Array<string | number>;
    fonts: {
      body: string;
      monospace: string;
    };
    colors: Record<string, string>;
    text: SystemStyleObject;
    buttons: SystemStyleObject;
    styles?: SystemStyleObject;
    shadows?: Record<string, string>;
    links?: SystemStyleObject;
    variants?: SystemStyleObject;
  };

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

export const useTheme = () => (useThemeUI().theme as unknown) as Theme;
