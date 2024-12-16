import type {} from "@mui/lab/themeAugmentation";
import { Theme, useTheme } from "@mui/material";

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
  // @ts-expect-error it works
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

  interface PaletteColor {
    hover?: string;
    disabled?: string;
    active?: string;
  }

  interface Palette {
    muted: PaletteColor;
    alert: PaletteColor;
    organization: PaletteColor;
    category: PaletteColor;
    brand: PaletteColor;
    hint: PaletteColor;
  }

  interface TypographyPropsVariantOverrides {
    tag: true;
  }

  interface ButtonPropsVariantOverrides {
    inline: true;
    inverted: true;
  }

  interface ButtonClasses {
    sizeXsmall: true;
  }

  interface ButtonPropsSizeOverrides {
    xsmall: true;
  }
}

export { theme as federal } from "./federal";
export { useTheme };
