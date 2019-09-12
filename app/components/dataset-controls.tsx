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
        <Label
          key={dim.iri.value}
          htmlFor={dim.labels.values}
          width={[1 / 2, 1 / 4]}
          p={2}
        >
          <Radio
            id={dim.labels.values}
            name={dim.labels.values}
            value={dim.labels.values}
            checked={false} //dim.labels.values === selectedDimension}
            onClick={() => updateDimension("dim.labels.values")}
          />
          {dim.labels.values}
        </Label>
      ))}

      <DSVisualization
        dataset={dataset}
        dimensions={meta.data.dimensions}
        dimension={selectedDimension}
        measures={meta.data.measures}
      />
    </>
  ) : null;
};
