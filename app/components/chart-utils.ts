import { Theme } from "@mui/material";
import { makeStyles } from "@mui/styles";

import { chartPanelLayoutGridClasses } from "@/components/chart-panel-layout-grid";

/** Generic styles shared between `ChartPreview` and `ChartPublished`. */
export const useChartStyles = makeStyles<Theme>((theme) => ({
  root: {
    display: "grid",
    gridTemplateRows: "subgrid",
    /** Should stay in sync with the number of rows contained in a chart */
    gridRow: "span 6",
    height: "100%",
    padding: theme.spacing(6),
    backgroundColor: theme.palette.background.paper,
    border: "1px solid",
    borderColor: theme.palette.divider,
    color: theme.palette.grey[800],

    [`.${chartPanelLayoutGridClasses.root} &`]: {
      display: "flex",
      flexDirection: "column",
    },
  },
}));
