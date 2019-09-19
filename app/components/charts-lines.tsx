import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForLineChart } from "../domain";
import { Lines } from "./charts-generic/lines";

export const ChartLines = ({
  observations,
  xField,
  groupByField,
  heightField,
  aggregationFunction
}: {
  observations: any[];
  xField: Dimension;
  groupByField: Dimension;
  heightField: Dimension;
  aggregationFunction: "sum";
}) => {
  const formattedData = formatDataForLineChart({
    observations,
    xField,
    groupByField,
    heightField
  });
  console.log({ formattedData });
  return (
    <>
      <h3>Bars</h3>
      <Lines
        data={formattedData}
        width={500}
        xField={xField.labels[0].value}
        yField={"measure"}
        groupBy={groupByField.labels[0].value}
        groupByLabel={groupByField.labels[0].value}
        aggregateFunction={"sum"}
      />
    </>
  );
};
