import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useObservations } from "../domain/data-cube";
import { Bars } from "./charts/bars";

export const DSVisualization = ({
  dataset,
  dimensions,
  dimension,
  measures
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  dimension: string;
  measures: Measure[];
}) => {
  const data = useObservations({ dataset, dimensions, dimension, measures });
  console.log(data);
  return data.state === "loaded" ? (
    <>
      <h3>Visualization</h3>

      <Bars
        data={data.data.results}
        width={500}
        xField={dimension}
        yField={"measure"}
        groupByField={dimension}
        groupByFieldLabel={dimension}
        aggregateFunction={"sum"}
      />
      <pre>{JSON.stringify(data.data.results, null, 2)}</pre>
    </>
  ) : null;
};
