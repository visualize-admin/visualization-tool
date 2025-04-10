import { useMediaQuery } from "@mui/material";

import { useTheme } from "../../themes";

export const TICK_FONT_SIZE = 12;

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.palette.text.primary;
  const domainColor = theme.palette.monochrome[800];
  const gridColor = theme.palette.cobalt[100];
  const fontFamily = theme.typography.fontFamily as string;
  const brushOverlayColor = theme.palette.monochrome[300];
  const brushSelectionColor = theme.palette.monochrome[500];
  const brushHandleStrokeColor = theme.palette.monochrome[500];
  const brushHandleFillColor = theme.palette.background.paper;

  const smallerTexts = useMediaQuery(theme.breakpoints.down("xl"));
  const axisLabelFontSize = smallerTexts ? 12 : 14;

  return {
    axisLabelFontSize,
    labelColor,
    labelFontSize: TICK_FONT_SIZE,
    domainColor,
    gridColor,
    fontFamily,
    brushOverlayColor,
    brushSelectionColor,
    brushHandleStrokeColor,
    brushHandleFillColor,
  };
};
