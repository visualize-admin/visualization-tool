import * as vega from "vega";
const labelColor = "#666666";
const legendLabelColor = "#454545";
const fontFamily = "FrutigerNeueRegular, Helvetica, Arial, sans-serif";

export const xAxisTheme: vega.Axis = {
  orient: "bottom",
  scale: "x",
  bandPosition: 0,
  domain: true,
  domainColor: labelColor,
  domainWidth: 1,
  grid: false,
  labelColor: labelColor,
  labelFont: fontFamily,
  labelFontSize: 12,
  labelAngle: 0,
  labelBaseline: "middle",
  labelPadding: 8,
  ticks: true,
  tickColor: labelColor
};

export const yAxisTheme: vega.Axis = {
  orient: "left",
  scale: "y",
  bandPosition: 0.5,
  domain: false,
  grid: true,
  gridColor: "#E5E5E5",
  labelFont: fontFamily,
  labelColor: labelColor,
  labelFontSize: 12,
  labelPadding: 8,
  ticks: false
};

export const legendTheme: vega.Legend = {
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
