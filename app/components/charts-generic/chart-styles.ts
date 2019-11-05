import { Axis, Legend } from "vega";

// FIXME: Use hook to get the theme values from ThemeProvider.

const labelColor = "#666666";
const legendLabelColor = "#454545";
const fontFamily = "FrutigerNeueRegular, Helvetica, Arial, sans-serif";

export const xAxisTheme: Axis = {
  orient: "bottom",
  scale: "x",
  bandPosition: 1,
  domain: true,
  domainColor: labelColor,
  domainWidth: 1,
  grid: false,
  labelColor: labelColor,
  labelFont: fontFamily,
  titleFont: fontFamily,
  titleColor: labelColor,
  labelFontSize: 12,
  labelAngle: 0,
  labelBaseline: "middle",
  labelPadding: 8,
  ticks: true,
  tickColor: labelColor
};

export const yAxisTheme: Axis = {
  orient: "left",
  scale: "y",
  bandPosition: 0.5,
  domain: false,
  grid: true,
  gridColor: "#E5E5E5",
  labelFont: fontFamily,
  titleFont: fontFamily,
  titleColor: labelColor,
  labelColor: labelColor,
  labelFontSize: 12,
  labelPadding: 8,
  ticks: false
};

export const legendTheme: Legend = {
  orient: "bottom",
  direction: "vertical",
  columns: 2,
  columnPadding: 8,
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
