import { useTheme } from "../../themes";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.colors.monochrome800;
  const legendLabelColor = theme.colors.monochrome700;
  const legendFontSize = 10;
  const domainColor = theme.colors.monochrome800;
  const gridColor = theme.colors.monochrome300;
  const labelFontSize = 12;
  const fontFamily = theme.fonts.body;
  const axisLabelFontSize = 14;
  const axisLabelFontWeight = 500;
  const axisLabelColor = theme.colors.monochrome800;
  const markBorderColor = theme.colors.monochrome100;
  const brushOverlayColor = theme.colors.monochrome300;
  const brushSelectionColor = theme.colors.monochrome600;
  const brushHandleStrokeColor = theme.colors.monochrome600;
  const brushHandleFillColor = theme.colors.monochrome100;

  return {
    axisLabelFontSize,
    axisLabelColor,
    axisLabelFontWeight,
    labelColor,
    labelFontSize,
    legendFontSize,
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
