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

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    primary: true;
    secondary: true;
    inherit: true;

    success: false;
    error: false;
    info: false;
    warning: false;
  }

  interface ButtonPropsSizeOverrides {
    small: false;
    medium: false;
    large: false;

    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/InputBase" {
  interface InputBasePropsSizeOverrides {
    small: false;
    medium: false;

    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides
    extends FederalTypographyPropsVariantOverrides {}
}

declare module "@mui/material/styles" {
  interface BreakpointOverrides extends FederalBreakpointOverrides {}

  interface Palette {
    cobalt: FederalColor & {
      main: string;
    };
    monochrome: FederalColor & {
      main: string;
    };
    red: FederalColor & {
      main: string;
    };
    orange: FederalColor & {
      main: string;
    };
    yellow: FederalColor & {
      main: string;
    };
    blue: FederalColor & {
      main: string;
    };
    green: FederalColor & {
      main: string;
    };
  }

  interface PaletteOptions {
    cobalt: FederalColor & {
      main: string;
    };
    monochrome: FederalColor & {
      main: string;
    };
    red: FederalColor & {
      main: string;
    };
    orange: FederalColor & {
      main: string;
    };
    yellow: FederalColor & {
      main: string;
    };
    blue: FederalColor & {
      main: string;
    };
    green: FederalColor & {
      main: string;
    };
  }
}

export { theme } from "./theme";
export { useTheme };
