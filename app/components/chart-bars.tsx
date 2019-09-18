import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Bars } from "./charts-generic/bars";

export const ChartBars = ({
  observations,
  xAxisField,
  heightField,
  aggregationFunction
}: {
  observations: any[];
  xAxisField: Dimension;
  heightField: Dimension;
  aggregationFunction: "sum";
}) => {
  // const data = useObservations({
  //   dataset,
  //   dimensions,
  //   selectedDimension: xAxis,
  //   measures
  // });
  return <div></div>;
  // return data.state === "loaded" ? (
  //   <>
  //     <h3>Bars</h3>

  //     <Bars
  //       data={data.data.results}
  //       width={500}
  //       xField={"selectedDimension"}
  //       yField={"measure"}
  //       groupByField={"selectedDimension"}
  //       groupByFieldLabel={"selectedDimension"}
  //       aggregateFunction={"sum"}
  //     />
  //     <pre>{JSON.stringify(data.data.results, null, 2)}</pre>
  //   </>
  // ) : null;
};
