import { Label, Radio } from "@rebass/forms";
import { Dimension, Measure, DataCube } from "@zazuko/query-rdf-data-cube";
import React, { useState } from "react";
import { useDataSetMetadata, useObservations } from "../domain/data-cube";
import { useLocale } from "../lib/use-locale";
import { DSVisualization } from "./dataset-visualization";

export const DSControls = ({ dataset }: { dataset: DataCube }) => {
  const [selectedDimension, updateDimension] = useState("");
  const locale = useLocale();
  const meta = useDataSetMetadata(dataset);

  return meta.state === "loaded" ? (
    <>
      <h3>Dimensions</h3>

      {meta.data.dimensions.map(dim => (
        <Label key={dim.iri.value} width={[1]} p={2}>
          <Radio
            id={dim.iri.value}
            name={dim.iri.value}
            value={dim.iri.value}
            checked={dim.iri.value === selectedDimension}
            onChange={() => updateDimension(dim.iri.value)}
          />
          {dim.labels[0].value}
        </Label>
      ))}

      <DSVisualization
        dataset={dataset}
        dimensions={meta.data.dimensions}
        selectedDimension={selectedDimension}
        measures={meta.data.measures}
      />
    </>
  ) : null;
};
