import { useTheme } from "../../themes";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = theme.colors.monochrome700; // FIXME: #666666 in Sketch
  const legendLabelColor = theme.colors.monochrome700;
  const domainColor = theme.colors.monochrome600;
  const gridColor = theme.colors.monochrome300;
  const labelFontSize = 12;
  const fontFamily = theme.fonts.body;
  return {
    labelColor,
    labelFontSize,
    domainColor,
    gridColor,
    legendLabelColor,
    fontFamily
  };
};
