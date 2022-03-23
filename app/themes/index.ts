import { Theme, useTheme } from "@mui/material";
import type {} from "@mui/lab/themeAugmentation";

export interface ThemeModule {
  theme: Theme;
  preloadFonts?: string[];
}

declare module "@mui/material" {
  interface Theme {
    dashed: true;
  }
}

declare module "@mui/material" {
  interface PaletteColorOptions {
    light?: string;
    main: string;
    hover?: string;
    active?: string;
    disabled?: string;
    colored?: string;
    dark?: string;
  }

  interface PaletteOptions {
    muted: PaletteColorOptions;
    alert: PaletteColorOptions;
    organization: PaletteColorOptions;
    category: PaletteColorOptions;
    brand: PaletteColorOptions;
    hint: PaletteColorOptions;
  }

  interface TypographyPropsVariantOverrides {
    tag: true;
  }

  interface ButtonPropsVariantOverrides {
    selectColorPicker: true;
    inline: true;
    inverted: true;
  }
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
