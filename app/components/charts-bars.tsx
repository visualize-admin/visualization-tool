import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForBarChart, getDimensionLabelFromIri } from "../domain";
import { Bars } from "./charts-generic/bars";

export const ChartBars = ({
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
  const formattedData = formatDataForBarChart({
    observations,
    dimensions,
    xField,
    groupByField,
    heightField
  });
  return (
    <Bars
      data={formattedData}
      width={600}
      xField={getDimensionLabelFromIri({ dimensionIri: xField, dimensions })}
      heightField={getDimensionLabelFromIri({
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
