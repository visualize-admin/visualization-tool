import { Breakpoint, createTheme, Theme } from "@mui/material/styles";
import omit from "lodash/omit";

import { components } from "./components";
import { palette } from "./palette";
import { shadows } from "./shadows";
import { typography } from "./typography";

const typographyBreakpoints = ["xs", "md"] as Breakpoint[];

const createTypographyVariant = (theme: Theme, spec: Record<string, any>) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${spec.lineHeight[i]}px`;
    const fontSize = `${spec.fontSize[i]}px`;
    res[theme.breakpoints.up(typographyBreakpoints[i])] = {
      fontSize,
      lineHeight,
    };
  }
  return res;
};
const spacing = [0, 4, 8, 12, 16, 24, 32, 64, 72];

const breakpoints = {
  values: { xs: 0, sm: 768, md: 992, lg: 1280, xl: 1360 },
};

const shape = {
  borderRadius: 2,
};

/**
 * Theme conforming to the Swiss Federal CD guidelines
 */
export const theme = createTheme({
  palette,
  breakpoints,
  spacing,
  shape,
  shadows,
  components,
  typography,
});
