import { i18n } from "@lingui/core";
import { defineMessage } from "@lingui/macro";

const fieldLabels = {
  "controls.axis.horizontal": defineMessage({
    id: "controls.axis.horizontal",
    message: "Horizontal axis",
  }),
  "controls.measure": defineMessage({
    id: "controls.measure",
    message: "Measure",
  }),
  "controls.axis.vertical": defineMessage({
    id: "controls.axis.vertical",
    message: "Vertical axis",
  }),
  "controls.animation": defineMessage({
    id: "controls.animation",
    message: "Animation",
  }),
  "controls.segment": defineMessage({
    id: "controls.segment",
    message: "Segmentation",
  }),
  "controls.color": defineMessage({ id: "controls.color", message: "Color" }),
  "controls.title": defineMessage({ id: "controls.title", message: "Title" }),
  "controls.description": defineMessage({
    id: "controls.description",
    message: "Description",
  }),
  "controls.label": defineMessage({
    id: "controls.label",
    message: "Tab label",
  }),
  "controls.column.stacked": defineMessage({
    id: "controls.column.stacked",
    message: "Stacked",
  }),
  "controls.column.grouped": defineMessage({
    id: "controls.column.grouped",
    message: "Grouped",
  }),
  "controls.bar.stacked": defineMessage({
    id: "controls.bar.stacked",
    message: "Stacked",
  }),
  "controls.bar.grouped": defineMessage({
    id: "controls.bar.grouped",
    message: "Grouped",
  }),
  "chart.map.layers.base": defineMessage({
    id: "chart.map.layers.base",
    message: "Base map",
  }),
  "chart.map.layers.area": defineMessage({
    id: "chart.map.layers.area",
    message: "Areas",
  }),
  "chart.map.layers.symbol": defineMessage({
    id: "chart.map.layers.symbol",
    message: "Symbols",
  }),
  "controls.sorting.sortBy": defineMessage({
    id: "controls.sorting.sortBy",
    message: "Sort by",
  }),
  "controls.sorting.byDimensionLabel.ascending": defineMessage({
    id: "controls.sorting.byDimensionLabel.ascending",
    message: "A → Z",
  }),
  "controls.sorting.byAuto.ascending": defineMessage({
    id: "controls.sorting.byDimensionLabel.ascending",
    message: "A → Z",
  }),
  "controls.sorting.byAuto.descending": defineMessage({
    id: "controls.sorting.byDimensionLabel.descending",
    message: "Z → A",
  }),
  "controls.sorting.byDimensionLabel.descending": defineMessage({
    id: "controls.sorting.byDimensionLabel.descending",
    message: "Z → A",
  }),
  "controls.sorting.byTotalSize.ascending": defineMessage({
    id: "controls.sorting.byTotalSize.ascending",
    message: "Largest last",
  }),
  "controls.sorting.byTotalSize.largestFirst": defineMessage({
    id: "controls.sorting.byTotalSize.largestFirst",
    message: "Largest first",
  }),
  "controls.sorting.byTotalSize.largestTop": defineMessage({
    id: "controls.sorting.byTotalSize.largestTop",
    message: "Largest top",
  }),
  "controls.sorting.byTotalSize.largestBottom": defineMessage({
    id: "controls.sorting.byTotalSize.largestBottom",
    message: "Largest bottom",
  }),
  "controls.sorting.byMeasure.ascending": defineMessage({
    id: "controls.sorting.byMeasure.ascending",
    message: "1 → 9",
  }),
  "controls.sorting.byMeasure.descending": defineMessage({
    id: "controls.sorting.byMeasure.descending",
    message: "9 → 1",
  }),
  "controls.abbreviations": defineMessage({
    id: "controls.abbreviations",
    message: "Use abbreviations",
  }),
  "controls.calculation.identity": defineMessage({
    id: "controls.calculation.identity",
    message: "Normal",
  }),
  "controls.calculation.percent": defineMessage({
    id: "controls.calculation.percent",
    message: "100%",
  }),
  "controls.imputation": defineMessage({
    id: "controls.imputation",
    message: "Imputation type",
  }),
  "controls.imputation.type.none": defineMessage({
    id: "controls.imputation.type.none",
    message: "-",
  }),
  "controls.imputation.type.zeros": defineMessage({
    id: "controls.imputation.type.zeros",
    message: "Zeros",
  }),
  "controls.imputation.type.linear": defineMessage({
    id: "controls.imputation.type.linear",
    message: "Linear interpolation",
  }),
  "controls.chart.type.column": defineMessage({
    id: "controls.chart.type.column",
    message: "Columns",
  }),
  "controls.chart.type.bar": defineMessage({
    id: "controls.chart.type.bar",
    message: "Bars",
  }),
  "controls.chart.type.line": defineMessage({
    id: "controls.chart.type.line",
    message: "Lines",
  }),
  "controls.chart.type.area": defineMessage({
    id: "controls.chart.type.area",
    message: "Areas",
  }),
  "controls.chart.type.scatterplot": defineMessage({
    id: "controls.chart.type.scatterplot",
    message: "Scatterplot",
  }),
  "controls.chart.type.pie": defineMessage({
    id: "controls.chart.type.pie",
    message: "Pie",
  }),
  "controls.chart.type.table": defineMessage({
    id: "controls.chart.type.table",
    message: "Table",
  }),
  "controls.chart.type.map": defineMessage({
    id: "controls.chart.type.map",
    message: "Map",
  }),
  "controls.chart.type.comboLineSingle": defineMessage({
    id: "controls.chart.type.comboLineSingle",
    message: "Multi-line",
  }),
  "controls.chart.type.comboLineDual": defineMessage({
    id: "controls.chart.type.comboLineDual",
    message: "Dual-axis line",
  }),
  "controls.chart.type.comboLineColumn": defineMessage({
    id: "controls.chart.type.comboLineColumn",
    message: "Column-line",
  }),
  "controls.layout.tab": defineMessage({
    id: "controls.layout.tab",
    message: "Tab Layout",
  }),
  "controls.layout.dashboard": defineMessage({
    id: "controls.layout.dashboard",
    message: "Dashboard",
  }),
  "controls.layout.singleURLs": defineMessage({
    id: "controls.layout.singleURLs",
    message: "Separate URLs",
  }),
  "controls.layout.tall": defineMessage({
    id: "controls.layout.tall",
    message: "Tall",
  }),
  "controls.layout.vertical": defineMessage({
    id: "controls.layout.vertical",
    message: "Vertical",
  }),
  "controls.layout.canvas": defineMessage({
    id: "controls.layout.canvas",
    message: "Free canvas",
  }),
  "controls.language.english": defineMessage({
    id: "controls.language.english",
    message: "English",
  }),
  "controls.language.german": defineMessage({
    id: "controls.language.german",
    message: "German",
  }),
  "controls.language.french": defineMessage({
    id: "controls.language.french",
    message: "French",
  }),
  "controls.language.italian": defineMessage({
    id: "controls.language.italian",
    message: "Italian",
  }),
};

export function getFieldLabel(field: string): string {
  switch (field) {
    // Visual encodings (left column)
    case "column.x":
    case "bar.x":
    case "line.x":
    case "area.x":
    case "scatterplot.x":
    case "pie.x":
    case "comboLineSingle.x":
    case "comboLineDual.x":
    case "comboLineColumn.x":
    case "x":
      return i18n._(fieldLabels["controls.axis.horizontal"]);
    case "bar.x":
    case "pie.y":
      return i18n._(fieldLabels["controls.measure"]);
    case "scatterplot.y":
    case "column.y":
    case "bar.y":
    case "line.y":
    case "area.y":
    case "bar.y":
    case "comboLineSingle.y":
    case "comboLineDual.y":
    case "comboLineColumn.y":
    case "y":
      return i18n._(fieldLabels["controls.axis.vertical"]);
    case "column.animation":
    case "bar.animation":
    case "line.animation":
    case "area.animation":
    case "scatterplot.animation":
    case "pie.animation":
    case "map.animation":
    case "animation":
      return i18n._(fieldLabels["controls.animation"]);
    case "column.segment":
    case "bar.segment":
    case "line.segment":
    case "area.segment":
    case "scatterplot.segment":
    case "pie.segment":
    case "segment":
      return i18n._(fieldLabels["controls.segment"]);
    case "baseLayer":
    case "map.baseLayer":
      return i18n._(fieldLabels["chart.map.layers.base"]);
    case "areaLayer":
    case "map.areaLayer":
      return i18n._(fieldLabels["chart.map.layers.area"]);
    case "symbolLayer":
    case "map.symbolLayer":
      return i18n._(fieldLabels["chart.map.layers.symbol"]);
    case "title":
      return i18n._(fieldLabels["controls.title"]);
    case "description":
      return i18n._(fieldLabels["controls.description"]);
    case "label":
      return i18n._(fieldLabels["controls.label"]);

    // Encoding Options
    case "stacked":
      return i18n._(fieldLabels["controls.column.stacked"]);
    case "grouped":
      return i18n._(fieldLabels["controls.column.grouped"]);
    case "sortBy":
      return i18n._(fieldLabels["controls.sorting.sortBy"]);
    case "imputation":
      return i18n._(fieldLabels["controls.imputation"]);
    case "abbreviations":
      return i18n._(fieldLabels["controls.abbreviations"]);
    case "identity":
      return i18n._(fieldLabels["controls.calculation.identity"]);
    case "percent":
      return i18n._(fieldLabels["controls.calculation.percent"]);

    case "column..byDimensionLabel.asc":
    case "column.stacked.byDimensionLabel.asc":
    case "column.grouped.byDimensionLabel.asc":
    case "bar..byDimensionLabel.asc":
    case "bar.stacked.byDimensionLabel.asc":
    case "bar.grouped.byDimensionLabel.asc":
    case "area..byDimensionLabel.asc":
    // for existing charts compatibility
    case "area.stacked.byDimensionLabel.asc":
    case "pie..byDimensionLabel.asc":
    case "line..byDimensionLabel.asc":
    case "sorting.byDimensionLabel.asc":
      return i18n._(fieldLabels["controls.sorting.byDimensionLabel.ascending"]);
    case "column..byAuto.asc":
    case "column.stacked.byAuto.asc":
    case "column.grouped.byAuto.asc":
    case "bar..byAuto.asc":
    case "bar.stacked.byAuto.asc":
    case "bar.grouped.byAuto.asc":
    case "pie..byAuto.asc":
    case "line..byAuto.asc":
    case "area..byAuto.asc":
      return i18n._(fieldLabels["controls.sorting.byAuto.ascending"]);
    case "column..byAuto.desc":
    case "column.stacked.byAuto.desc":
    case "column.grouped.byAuto.desc":
    case "bar..byAuto.desc":
    case "bar.stacked.byAuto.desc":
    case "bar.grouped.byAuto.desc":
    case "pie..byAuto.desc":
    case "line..byAuto.desc":
    case "area..byAuto.desc":
      return i18n._(fieldLabels["controls.sorting.byAuto.descending"]);
    case "column..byDimensionLabel.desc":
    case "column.stacked.byDimensionLabel.desc":
    case "column.grouped.byDimensionLabel.desc":
    case "bar..byDimensionLabel.desc":
    case "bar.stacked.byDimensionLabel.desc":
    case "bar.grouped.byDimensionLabel.desc":
    case "area..byDimensionLabel.desc":
    // for existing charts compatibility
    case "area.stacked.byDimensionLabel.desc":
    case "pie..byDimensionLabel.desc":
    case "line..byDimensionLabel.desc":
    case "sorting.byDimensionLabel.desc":
      return i18n._(
        fieldLabels["controls.sorting.byDimensionLabel.descending"]
      );
    case "column.grouped.byTotalSize.asc":
    case "bar.grouped.byTotalSize.asc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.ascending"]);
    case "column.grouped.byTotalSize.desc":
    case "bar.grouped.byTotalSize.desc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestFirst"]);
    case "area..byTotalSize.asc":
    // for existing charts compatibility
    case "area.stacked.byTotalSize.asc":
    case "column.stacked.byTotalSize.asc":
    case "bar.stacked.byTotalSize.asc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestTop"]);
    case "area..byTotalSize.desc":
    // for existing charts compatibility
    case "area.stacked.byTotalSize.desc":
    case "column.stacked.byTotalSize.desc":
    case "bar.stacked.byTotalSize.desc":
      return i18n._(fieldLabels["controls.sorting.byTotalSize.largestBottom"]);
    case "column..byMeasure.asc":
    case "column.stacked.byMeasure.asc":
    case "column.grouped.byMeasure.asc":
    case "bar..byMeasure.asc":
    case "bar.stacked.byMeasure.asc":
    case "bar.grouped.byMeasure.asc":
    case "pie..byMeasure.asc":
    case "sorting.byMeasure.asc":
      return i18n._(fieldLabels["controls.sorting.byMeasure.ascending"]);
    case "column..byMeasure.desc":
    case "column.stacked.byMeasure.desc":
    case "column.grouped.byMeasure.desc":
    case "bar..byMeasure.desc":
    case "bar.stacked.byMeasure.desc":
    case "bar.grouped.byMeasure.desc":
    case "pie..byMeasure.desc":
    case "sorting.byMeasure.desc":
      return i18n._(fieldLabels["controls.sorting.byMeasure.descending"]);

    // Chart Types
    case "column":
      return i18n._(fieldLabels["controls.chart.type.column"]);
    case "bar":
      return i18n._(fieldLabels["controls.chart.type.bar"]);
    case "line":
      return i18n._(fieldLabels["controls.chart.type.line"]);
    case "area":
      return i18n._(fieldLabels["controls.chart.type.area"]);
    case "scatterplot":
      return i18n._(fieldLabels["controls.chart.type.scatterplot"]);
    case "pie":
      return i18n._(fieldLabels["controls.chart.type.pie"]);
    case "table":
      return i18n._(fieldLabels["controls.chart.type.table"]);
    case "map":
      return i18n._(fieldLabels["controls.chart.type.map"]);
    case "comboLineSingle":
      return i18n._(fieldLabels["controls.chart.type.comboLineSingle"]);
    case "comboLineDual":
      return i18n._(fieldLabels["controls.chart.type.comboLineDual"]);
    case "comboLineColumn":
      return i18n._(fieldLabels["controls.chart.type.comboLineColumn"]);

    // Layout types
    case "layoutTab":
      return i18n._(fieldLabels["controls.layout.tab"]);
    case "layoutDashboard":
      return i18n._(fieldLabels["controls.layout.dashboard"]);
    case "layoutTall":
      return i18n._(fieldLabels["controls.layout.tall"]);
    case "layoutVertical":
      return i18n._(fieldLabels["controls.layout.vertical"]);
    case "layoutCanvas":
      return i18n._(fieldLabels["controls.layout.canvas"]);
    case "layoutSingleURLs":
      return i18n._(fieldLabels["controls.layout.singleURLs"]);

    // Languages
    case "en":
      return i18n._(fieldLabels["controls.language.english"]);
    case "de":
      return i18n._(fieldLabels["controls.language.german"]);
    case "fr":
      return i18n._(fieldLabels["controls.language.french"]);
    case "it":
      return i18n._(fieldLabels["controls.language.italian"]);
    default:
      return field;
  }
}
