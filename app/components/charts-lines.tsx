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
  console.log({ formattedData });
  return (
    <>
      <h3>Lines</h3>
      <Lines
        data={formattedData}
        width={500}
        xField={xField}
        yField={"measure"}
        groupBy={groupByField}
        groupByLabel={groupByField}
        aggregateFunction={"sum"}
      />
    </>
  );
};
