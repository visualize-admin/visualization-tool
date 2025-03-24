import { useTheme } from "../../themes";

export const TICK_FONT_SIZE = 12;
export const AXIS_LABEL_FONT_SIZE = 12;

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.palette.grey[800];
  const legendLabelColor = theme.palette.grey[700];
  const domainColor = theme.palette.grey[800];
  const gridColor = theme.palette.grey[300];
  const fontFamily = theme.typography.fontFamily as string;
  const axisLabelFontSize = AXIS_LABEL_FONT_SIZE;
  const axisLabelFontWeight = 500;
  const axisLabelColor = theme.palette.grey[800];
  const markBorderColor = theme.palette.grey[100];
  const brushOverlayColor = theme.palette.grey[300];
  const brushSelectionColor = theme.palette.grey[600];
  const brushHandleStrokeColor = theme.palette.grey[600];
  const brushHandleFillColor = theme.palette.grey[100];

  return {
    axisLabelFontSize,
    axisLabelColor,
    axisLabelFontWeight,
    labelColor,
    labelFontSize: TICK_FONT_SIZE,
    domainColor,
    gridColor,
    legendLabelColor,
    fontFamily,
    markBorderColor,
    brushOverlayColor,
    brushSelectionColor,
    brushHandleStrokeColor,
    brushHandleFillColor,
  };
};
