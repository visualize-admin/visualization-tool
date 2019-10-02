import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForAreaChart, getDimensionLabelFromIri } from "../domain";
import { Areas } from "./charts-generic/areas";

export const ChartAreas = ({
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
  const formattedData = formatDataForAreaChart({
    observations,
    dimensions,
    xField,
    groupByField,
    heightField
  });
  return (
    <Areas
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
