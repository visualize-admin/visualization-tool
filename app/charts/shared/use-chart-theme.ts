import { useTheme } from "../../themes";

export const TICK_FONT_SIZE = 12;
export const AXIS_LABEL_FONT_SIZE = 12;

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.palette.text.primary;
  const domainColor = theme.palette.monochrome[800];
  const gridColor = theme.palette.cobalt[100];
  const fontFamily = theme.typography.fontFamily as string;
  const axisLabelFontSize = AXIS_LABEL_FONT_SIZE;
  const brushOverlayColor = theme.palette.monochrome[300];
  const brushSelectionColor = theme.palette.monochrome[500];
  const brushHandleStrokeColor = theme.palette.monochrome[500];
  const brushHandleFillColor = theme.palette.background.paper;

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
