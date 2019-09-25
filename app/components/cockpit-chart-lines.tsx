import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { useDataSetMetadata } from "../domain/data-cube";
import { Field } from "./field";

export const CockpitChartLines = ({
  chartId,
  dataset
}: {
  chartId: string;
  dataset: DataCube;
}) => {
  const meta = useDataSetMetadata(dataset);
  if (meta.state === "loaded") {
    return (
      <>
        <Field
          type="checkbox"
          chartId={chartId}
          path={"chartConfig.dimensions.bananas"}
          label="Bananas"
        />
        <Field
          type="checkbox"
          chartId={chartId}
          path={"chartConfig.dimensions.apples"}
          label="Apples"
        />
      </>
    );
  } else {
    return <div>Loading metadata</div>;
  }
};
