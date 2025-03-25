import {
  FederalBreakpointOverrides,
  FederalColor,
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

declare module "@mui/material/styles" {
  interface BreakpointOverrides extends FederalBreakpointOverrides {}

  interface Palette {
    cobalt: FederalColor;
    monochrome: FederalColor;
    red: FederalColor;
    blue: FederalColor;
    green: FederalColor;
  }

  interface PaletteOptions {
    cobalt: FederalColor;
    monochrome: FederalColor;
    red: FederalColor;
    blue: FederalColor;
    green: FederalColor;
  }
}

export { theme as federal } from "./federal";
export { useTheme };
