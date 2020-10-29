import { Trans } from "@lingui/macro";
import { ReactNode } from "react";
import { IconName } from "../../icons";

export const getIconName = (name: string): IconName => {
  switch (name) {
    case "x":
      return "x";
    case "y":
      return "y";
    case "segment":
      return "segment";
    case "table":
      return "table";
    case "filter":
      return "filter";
    case "column":
      return "column";
    case "bar":
      return "bar";
    case "line":
      return "line";
    case "area":
      return "area";
    case "scatterplot":
      return "scatterplot";
    case "pie":
      return "pie";
    default:
      return "table";
  }
};

export const getFieldLabel = (field: string): ReactNode => {
  switch (field) {
    // Visual encodings (left column)
    case "column.x":
    case "line.x":
    case "area.x":
    case "pie.x":
    case "x":
      return <Trans id="controls.axis.horizontal">Horizontal axis</Trans>;
    case "bar.x":
    case "scatterplot.x":
    case "scatterplot.y":
    case "column.y":
    case "line.y":
    case "area.y":
    case "pie.y":
    case "y":
      return <Trans id="controls.measure">Measure</Trans>;
    case "bar.y":
      return <Trans id="controls.axis.vertical">Vertical axis</Trans>;
    case "bar.segment":
    case "column.segment":
    case "line.segment":
    case "area.segment":
    case "scatterplot.segment":
    case "pie.segment":
    case "segment":
      return <Trans id="controls.partition">Partition</Trans>;
    case "title":
      return <Trans id="controls.title">Title</Trans>;
    case "description":
      return <Trans id="controls.description">Description</Trans>;

    // Encoding Options  (right column)
    case "stacked":
      return <Trans id="controls.column.stacked">Stacked</Trans>;
    case "grouped":
      return <Trans id="controls.column.grouped">Grouped</Trans>;
    case "sortBy":
      return <Trans id="controls.sorting.sortBy">Sort by</Trans>;

    case "bar.stacked.byDimensionLabel.asc":
    case "bar.grouped.byDimensionLabel.asc":
    case "column..byDimensionLabel.asc":
    case "column.stacked.byDimensionLabel.asc":
    case "column.grouped.byDimensionLabel.asc":
    case "area.stacked.byDimensionLabel.asc":
    case "pie..byDimensionLabel.asc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.ascending">A → Z</Trans>
      );
    case "bar.stacked.byDimensionLabel.desc":
    case "bar.grouped.byDimensionLabel.desc":
    case "column..byDimensionLabel.desc":
    case "column.stacked.byDimensionLabel.desc":
    case "column.grouped.byDimensionLabel.desc":
    case "area.stacked.byDimensionLabel.desc":
    case "pie..byDimensionLabel.desc":
      return (
        <Trans id="controls.sorting.byDimensionLabel.descending">Z → A</Trans>
      );
    case "bar.stacked.byTotalSize.desc":
    case "bar.grouped.byTotalSize.desc":
    case "column.grouped.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.ascending">Largest last</Trans>
      );
    case "column.grouped.byTotalSize.desc":
    case "bar.stacked.byTotalSize.asc":
    case "bar.grouped.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.largestFirst">
          Largest first
        </Trans>
      );
    case "area.stacked.byTotalSize.asc":
    case "column.stacked.byTotalSize.asc":
      return (
        <Trans id="controls.sorting.byTotalSize.largestTop">Largest top</Trans>
      );
    case "area.stacked.byTotalSize.desc":
    case "column.stacked.byTotalSize.desc":
      return (
        <Trans id="controls.sorting.byTotalSize.largestBottom">
          Largest bottom
        </Trans>
      );
    case "column..byMeasure.asc":
    case "column.stacked.byMeasure.asc":
    case "column.grouped.byMeasure.asc":
    case "pie..byMeasure.asc":
      return <Trans id="controls.sorting.byMeasure.ascending">1 → 9</Trans>;
    case "column..byMeasure.desc":
    case "column.stacked.byMeasure.desc":
    case "column.grouped.byMeasure.desc":
    case "pie..byMeasure.desc":
      return <Trans id="controls.sorting.byMeasure.descending">9 → 1</Trans>;

    // Chart Types
    case "column":
      return <Trans id="controls.chart.type.column">Columns</Trans>;
    case "bar":
      return <Trans id="controls.chart.type.bar">Bars</Trans>;
    case "line":
      return <Trans id="controls.chart.type.line">Lines</Trans>;
    case "area":
      return <Trans id="controls.chart.type.area">Areas</Trans>;
    case "scatterplot":
      return <Trans id="controls.chart.type.scatterplot">Scatterplot</Trans>;
    case "pie":
      return <Trans id="controls.chart.type.pie">Pie</Trans>;
    case "table":
      return <Trans id="controls.chart.type.table">Table</Trans>;

    // Languages
    case "en":
      return <Trans id="controls.language.english">English</Trans>;
    case "de":
      return <Trans id="controls.language.german">German</Trans>;
    case "fr":
      return <Trans id="controls.language.french">French</Trans>;
    case "it":
      return <Trans id="controls.language.italian">Italian</Trans>;
    default:
      return field;
  }
};

export const getFieldLabelHint = {
  x: <Trans id="controls.select.dimension">Select a dimension</Trans>,
  y: <Trans id="controls.select.measure">Select a measure</Trans>,
  segment: <Trans id="controls.select.dimension">Select a dimension</Trans>,
};
