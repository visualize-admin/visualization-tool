import { Label, Radio } from "@rebass/forms";
import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { useDataSetMetadata, useObservations } from "../domain/data-cube";
import { useLocale } from "../lib/use-locale";
import { DSVisualization } from "./dataset-visualization";
import { DSDimensionSelect } from "./dataset-dimension-select";

export const DSControls = ({ dataset }: { dataset: DataCube }) => {
  const [selectedDimension, updateDimension] = useState("");
  const locale = useLocale();
  const meta = useDataSetMetadata(dataset);

  return meta.state === "loaded" ? (
    <>
      <h3>Dimensions</h3>
      <DSDimensionSelect
        dimensions={meta.data.dimensions}
        selectedDimension={selectedDimension}
        updateDimension={updateDimension}
      />

      <DSVisualization
        dataset={dataset}
        dimensions={meta.data.dimensions}
        selectedDimension={selectedDimension}
        measures={meta.data.measures}
      />
    </>
  ) : null;
};
