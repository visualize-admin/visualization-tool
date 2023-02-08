import { Breakpoint, Theme } from "@mui/material/styles";
import omit from "lodash/omit";

const breakpoints = ["xs", "md"] as Breakpoint[];

export const createTypographyVariant = (
  theme: Theme,
  spec: Record<string, any>
) => {
  const res = omit(spec, ["lineHeight", "fontSize", "fontFamily"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${spec.lineHeight[i]}px`;
    const fontSize = `${spec.fontSize[i]}px`;
    res[theme.breakpoints.up(breakpoints[i])] = {
      fontSize,
      lineHeight,
      fontFamily: theme.typography.fontFamily,
    };
  }
  return res;
};
