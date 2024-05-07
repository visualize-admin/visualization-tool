import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { shouldShowDebugPanel } from "@/components/debug-panel";

/** Generic styles shared between `ChartPreview` and `ChartPublished`. */
export const useChartStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "subgrid",
    gridRow: shouldShowDebugPanel() ? "span 7" : "span 6",
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    border: "1px solid",
    borderColor: theme.palette.divider,
    color: theme.palette.grey[800],
  },
}));
