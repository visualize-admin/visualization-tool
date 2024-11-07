import "@mui/lab/themeAugmentation";
import { Theme, useTheme } from "@mui/material";
import { CSSProperties } from "react";

export interface ThemeModule {
  theme: Theme;
  preloadFonts?: string[];
}
declare module "@mui/material" {
  interface Theme {
    dashed: true;
    logos: {
      mobile: string;
      desktop: string;
    };
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    link: true;
  }
}

declare module "@mui/material" {
  interface TypographyVariants {
    link: CSSProperties;
  }

  interface TypographyVariantsOptions {
    link?: CSSProperties;
  }

  interface PaletteColorOptions {
    light?: string;
    main?: string;
    contrastText?: string;
    onLight?: string;
    hover?: string;
    active?: string;
    disabled?: string;
    colored?: string;
    dark?: string;
  }

  interface PaletteOptions {
    muted: PaletteColorOptions;
    alert?: PaletteColorOptions;
    organization?: PaletteColorOptions;
    category?: PaletteColorOptions;
    termset?: PaletteColorOptions;
    brand?: PaletteColorOptions;
    hint?: PaletteColorOptions;
    component?: {
      header?: ComponentColor;
      banner?: ComponentColor;
    };
  }

  interface PaletteColor {
    hover?: string;
    onLight?: string;
    disabled?: string;
    active?: string;
  }

  interface ComponentColor {
    background?: string;
    foreground?: string;
    border?: string;
  }

  interface Palette {
    muted: PaletteColor;
    alert: PaletteColor;
    organization: PaletteColor;
    category: PaletteColor;
    termset: PaletteColor;
    brand: PaletteColor;
    hint: PaletteColor;
    component?: {
      header?: ComponentColor;
      banner?: ComponentColor;
    };
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

export { useTheme };
