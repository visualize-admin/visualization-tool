import React from "react";
import { formatDataForLineChart, getDimensionLabelFromIri } from "../domain";
import { Lines } from "./charts-generic/lines";
import { Dimension } from "@zazuko/query-rdf-data-cube";

export const ChartLines = ({
  observations,
  dimensions,
  xField,
  groupByField,
  heightField,
  aggregationFunction
}: {
  observations: any[];
  dimensions: Dimension[];
  xField: string;
  groupByField: string;
  heightField: string;
  aggregationFunction: "sum";
}) => {
  const formattedData = formatDataForLineChart({
    observations,
    dimensions,
    xField,
    groupByField,
    heightField
  });
  return (
    <Lines
      data={formattedData}
      width={600}
      xField={getDimensionLabelFromIri({ dimensionIri: xField, dimensions })}
      yField={getDimensionLabelFromIri({
        dimensionIri: heightField,
        dimensions
      })}
      groupBy={getDimensionLabelFromIri({
        dimensionIri: groupByField,
        dimensions
      })}
      groupByLabel={getDimensionLabelFromIri({
        dimensionIri: groupByField,
        dimensions
      })}
      aggregateFunction={aggregationFunction}
    />
  );
};
