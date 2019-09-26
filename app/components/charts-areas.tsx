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
  xField: string;
  groupByField: string;
  heightField: string;
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
        timeField={xField}
        yField={"measure"}
        groupBy={groupByField}
        groupByLabel={groupByField}
        aggregateFunction={"sum"}
      />
    </>
  );
};
