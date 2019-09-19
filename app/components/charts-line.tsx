import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForLineChart } from "../domain";
import { Lines } from "./charts-generic/lines";

export const ChartLines = ({
  observations,
  xField,
  heightField,
  aggregationFunction
}: {
  observations: any[];
  xField: Dimension;
  heightField: Dimension;
  aggregationFunction: "sum";
}) => {
  const formattedData = formatDataForLineChart({
    observations,
    xField,
    heightField
  });

  return (
    <>
      <h3>Bars</h3>
      <Lines
        data={formattedData}
        width={500}
        xField={xField.labels[0].value}
        yField={"measure"}
        groupBy={xField.labels[0].value}
        groupByLabel={xField.labels[0].value}
        aggregateFunction={"sum"}
      />
    </>
  );
};
