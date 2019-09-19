import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { formatDataForLineChart } from "../domain";
import { Areas } from "./charts-generic/areas";

export const ChartAreas = ({
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
  console.log(JSON.stringify(formattedData, null, 2));
  return (
    <>
      <h3>Areas</h3>
      <Areas
        data={formattedData}
        width={500}
        timeField={xField.labels[0].value}
        yField={"measure"}
        groupBy={groupByField.labels[0].value}
        groupByLabel={groupByField.labels[0].value}
        aggregateFunction={"sum"}
      />
    </>
  );
};
