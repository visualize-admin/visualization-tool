import { Theme } from "@mui/material";
import { createMakeAndWithStyles } from "tss-react";

import { c, theme } from "@/federal-ci/theme";

type FederalTheme = Omit<Theme, "palette"> & { palette: typeof c };

export const { makeStyles } = createMakeAndWithStyles({
  useTheme: () => theme as unknown as FederalTheme,
});
