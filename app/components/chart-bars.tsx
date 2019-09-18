import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations } from "../domain/data-cube";
import { Bars } from "./charts-generic/bars";

export const DSBars = ({
  dataset,
  dimensions,
  xAxis,
  measures
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  xAxis: string;
  aggregationFunction: "sum";
  measures: Measure[];
}) => {
  const data = useObservations({
    dataset,
    dimensions,
    selectedDimension: xAxis,
    measures
  });

  return data.state === "loaded" ? (
    <>
      <h3>Bars</h3>

      <Bars
        data={data.data.results}
        width={500}
        xField={"selectedDimension"}
        yField={"measure"}
        groupByField={"selectedDimension"}
        groupByFieldLabel={"selectedDimension"}
        aggregateFunction={"sum"}
      />
      <pre>{JSON.stringify(data.data.results, null, 2)}</pre>
    </>
  ) : null;
};
