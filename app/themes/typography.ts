import { t as federalTypography } from "@interactivethings/swiss-federal-ci";
import { type Typography } from "@mui/material/styles/createTypography";

const fontFamily = [
  '"NotoSans"',
  "-apple-system",
  "BlinkMacSystemFont",
  '"Segoe UI"',
  "Helvetica",
  "Arial",
  "sans-serif",
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(",");

function overrideFontFamily(typography: typeof federalTypography) {
  return {
    ...(Object.fromEntries(
      Object.entries(typography).map(([variant, responsiveFontProps]) => [
        variant,
        Object.fromEntries(
          Object.entries(responsiveFontProps).map(([breakpoint, fontProps]) => [
            breakpoint,
            {
              ...(fontProps as object),
              fontFamily,
            },
          ])
        ),
      ])
    ) as unknown as Typography),
    fontFamily,
  };
}

export const typography: Typography = overrideFontFamily(federalTypography);
