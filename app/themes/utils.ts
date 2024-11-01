import { Breakpoint, Theme } from "@mui/material";
import omit from "lodash/omit";
export const isSafari15 =
  typeof navigator !== "undefined" && navigator.vendor?.indexOf("Apple") >= 0
    ? navigator.userAgent
        .match(/Version[/\s]([\d]+)/g)?.[0]
        ?.split("/")?.[1] === "15"
    : false;

const breakpoints = ["xs", "md"] as Breakpoint[];

export const createTypographyVariant = (
  theme: Theme,
  spec: Record<string, any>
) => {
  const res = omit(spec, ["lineHeight", "fontSize"]);
  for (let i = 0; i < spec.fontSize.length; i++) {
    const lineHeight = `${spec.lineHeight[i]}px`;
    const fontSize = `${spec.fontSize[i]}px`;
    res[theme.breakpoints.up(breakpoints[i])] = {
      fontSize,
      lineHeight,
    };
  }
  return res;
};
