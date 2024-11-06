import { createTheme, ThemeOptions } from "@mui/material";

import { components } from "./components";
import { shadows } from "./shadows";
import { typography } from "./typography";

const spacing = [0, 4, 8, 12, 16, 24, 32, 64, 72];

const breakpoints = {
  values: { xs: 0, sm: 768, md: 992, lg: 1280, xl: 1360 },
};

const shape = {
  borderRadius: 2,
};

export const themeOptions: ThemeOptions = {
  breakpoints,
  spacing,
  shape,
  shadows,
  components,
  typography,
};

export const theme = createTheme(themeOptions);
