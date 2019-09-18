import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Bars } from "./charts-generic/bars";
import { formatDataForBarCHart } from "../domain/data-cube";

export const ChartBars = ({
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
  const formattedData = formatDataForBarCHart({
    observations,
    xField,
    heightField
  });

  return (
    <>
      <h3>Bars</h3>
      <Bars
        data={formattedData}
        width={500}
        xField={xField.labels[0].value}
        heightField={"measure"}
        groupBy={xField.labels[0].value}
        groupByLabel={xField.labels[0].value}
        aggregateFunction={"sum"}
      />
      {/* <pre>{JSON.stringify(observations, null, 2)}</pre> */}
    </>
  );
};
