import { createTheme } from "@mui/material/styles";

import { components } from "./components";
import { palette } from "./palette";
import { shadows } from "./shadows";
import { typography } from "./typography";

const spacing = [0, 4, 8, 12, 16, 24, 32, 64, 72];

const breakpoints = {
  values: { xs: 0, sm: 768, md: 992, lg: 1280, xl: 1360 },
};

const shape = {
  borderRadius: 2,
};

export const theme = createTheme({
  palette,
  breakpoints,
  spacing,
  shape,
  shadows,
  components,
  typography,
});
