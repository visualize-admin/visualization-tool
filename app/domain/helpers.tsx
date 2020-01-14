import { Trans } from "@lingui/macro";
import * as React from "react";
import { IconName } from "../icons";

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
    default:
      return "table";
  }
};

export const getFieldLabel = (field: string): React.ReactNode => {
  switch (field) {
    case "x":
      return <Trans id="controls.axis.horizontal">Horizontal axis</Trans>;
    case "y":
      return <Trans id="controls.measure">Measure</Trans>;
    case "segment":
      return <Trans id="controls.segmentation">Segmentation</Trans>;
    case "title":
      return <Trans id="controls.title">Title</Trans>;
    case "description":
      return <Trans id="controls.description">Description</Trans>;
    case "stacked":
      return <Trans id="controls.column.stacked">Stacked</Trans>;
    case "grouped":
      return <Trans id="controls.column.grouped">Grouped</Trans>;
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
