import * as vega from "vega";

export const xAxisTheme: vega.Axis = {
  orient: "bottom",
  scale: "x",
  bandPosition: 0,
  domain: true,
  domainColor: "#666666",
  domainWidth: 1,
  grid: false,
  labelColor: "#666666",
  labelFont: "FrutigerNeueRegular",
  labelFontSize: 12,
  labelAngle: 0,
  labelBaseline: "middle",
  labelPadding: 8,
  ticks: true,
  tickColor: "#666666"
};

export const yAxisTheme: vega.Axis = {
  orient: "left",
  scale: "y",
  bandPosition: 0.5,
  domain: false,
  grid: true,
  gridColor: "#dedede",
  labelFont: "FrutigerNeueRegular",
  labelColor: "#666666",
  labelFontSize: 12,
  labelPadding: 8,
  ticks: false
};
