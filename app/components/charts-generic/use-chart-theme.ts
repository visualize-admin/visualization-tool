import { Legend } from "vega";
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

// FIXME: Use hook to get the theme values from ThemeProvider.
const legendLabelColor = "#454545";
const fontFamily = "FrutigerNeueRegular, Helvetica, Arial, sans-serif";

// FIXME: quick fix for label orientation
export const getLabelAngle = (nbXLabels: number): number =>
  nbXLabels > 6 ? -90 : 0;
export const getLabelPosition = (nbXLabels: number): "center" | "right" =>
  nbXLabels > 6 ? "right" : "center";

export const legendTheme: Legend = {
  orient: "bottom",
  direction: "vertical",
  columns: 2,
  columnPadding: 32,
  rowPadding: 4,
  labelColor: legendLabelColor,
  labelFontSize: 12,
  labelFontStyle: fontFamily,
  labelOffset: 8,
  symbolType: "square",
  titleColor: legendLabelColor,
  titleFont: fontFamily,
  titleFontSize: 12
};
