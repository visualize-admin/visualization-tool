import { type Breakpoint, type Breakpoints } from "@mui/material/styles";
import {
  type TypographyOptions,
  type Variant,
} from "@mui/material/styles/createTypography";

const breakpoints = ["xxs", "xl"] as Breakpoint[];

export const createTypographyVariant = (
  b: Breakpoints,
  spec: {
    fontSize: number[];
    lineHeight: string;
  } & Omit<NonNullable<TypographyOptions[Variant]>, "fontSize" | "lineHeight">
) => {
  const { lineHeight, fontSize, ...res } = spec;

  for (let i = 0; i < spec.fontSize.length; i++) {
    const fontSize = `${spec.fontSize[i]}px`;
    const lineHeight = spec.lineHeight;
    res[b.up(breakpoints[i] as Breakpoint)] = {
      fontSize,
      lineHeight,
      fontFamily: "inherit",
    };
  }

  return res;
};
