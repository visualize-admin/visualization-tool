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
      return <Trans>Horizontal axis</Trans>;
    case "y":
      return <Trans>Measure</Trans>;
    case "segment":
      return <Trans>Segmentation</Trans>;
    case "title":
      return <Trans>Title</Trans>;
    case "description":
      return <Trans>Description</Trans>;
    case "stacked":
      return <Trans>Stacked</Trans>;
    case "grouped":
      return <Trans>Grouped</Trans>;
    default:
      return field;
  }
};
