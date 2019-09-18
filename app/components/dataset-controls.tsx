import { Label, Radio } from "@rebass/forms";
import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { useDataSetMetadata, useObservations } from "../domain/data-cube";

import { DSBars } from "./chart-bars";
import { DSDimensionSelect } from "./dataset-dimension-select";
import { DSFilter } from "./dataset-dimension-filter";

const Controls = ({
  dataset,
  dimensions,
  measures
}: {
  dataset: DataCube;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const [selectedDimension, updateDimension] = useState(
    dimensions[0].iri.value
  );
  const [dimensionFilter, addDimensionFilter] = useState({}); // {dimension: dimensionValue[]}

  const observations = useObservations({
    dataset,
    dimensions,
    selectedDimension,
    measures
  });
  console.log({ observations });
  const dimensionsWithLabel = dimensions.map(dim => {
    const key = dim.labels[0].value;
    return [key, dim];
  });
  console.log({ dimensionsWithLabel });

  return observations.state === "loaded" ? (
    <>
      <DSDimensionSelect
        dimensions={dimensions}
        selectedDimension={selectedDimension}
        updateDimension={updateDimension}
      />
      <DSFilter observations={observations.data} dimensions={dimensions} />
      {/* <DSBars
        dataset={dataset}
        dimensions={dimensions}
        xAxis={selectedDimension}
        aggregationFunction={"sum"}
        measures={measures}
      /> */}
    </>
  ) : null;
};

export const DSControls = ({ dataset }: { dataset: DataCube }) => {
  const meta = useDataSetMetadata(dataset);

  return meta.state === "loaded" ? (
    <>
      <Controls
        dataset={dataset}
        dimensions={meta.data.dimensions}
        measures={meta.data.measures}
      />
    </>
  ) : null;
};
