import {
  FederalTypographyPropsVariantOverrides,
  FederalTypographyVariants,
  FederalTypographyVariantsOptions,
} from "@interactivethings/swiss-federal-ci";
import type {} from "@mui/lab/themeAugmentation";
import { useTheme } from "@mui/material";

declare module "@mui/material" {
  interface TypographyVariants extends FederalTypographyVariants {}

  interface TypographyVariantsOptions
    extends FederalTypographyVariantsOptions {}
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides
    extends FederalTypographyPropsVariantOverrides {}
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
