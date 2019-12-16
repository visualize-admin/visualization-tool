import { Legend } from "vega";
import { useTheme } from "../../themes";

export const useChartTheme = () => {
  const theme = useTheme();
  const labelColor = (theme as $FixMe).colors.monochrome["700"] as string; // FIXME: #666666 in Sketch
  const legendLabelColor = (theme as $FixMe).colors.monochrome["700"] as string;
  const domainColor = (theme as $FixMe).colors.monochrome["700"] as string;
  const gridColor = (theme as $FixMe).colors.monochrome["300"] as string;

  const fontFamily = theme.fonts.frutigerRegular;
  return { labelColor, domainColor, gridColor, legendLabelColor, fontFamily };
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
