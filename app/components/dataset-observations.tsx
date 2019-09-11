import { Label, Radio } from "@rebass/forms";
import {
  Dimension,
  Measure
} from "@zazuko/query-rdf-data-cube/dist/node/components";
import DataSet from "@zazuko/query-rdf-data-cube/dist/node/dataset";
import React, { useState } from "react";
import { useDataSetMetadata, useObservations } from "../domain/data-cube";
import { useLocale } from "../lib/use-locale";
import { DSChart } from "./dataset-chart";

export const DSObservations = ({ dataset }: { dataset: DataSet }) => {
  const [selectedDimension, updateDimension] = useState("");
  const locale = useLocale();
  const meta = useDataSetMetadata(dataset);

  return meta.state === "loaded" ? (
    <>
      <h3>Dimensions</h3>

      {meta.data.dimensions.map(dim => (
        <Label
          key={dim.iri.value}
          htmlFor={dim.label.value}
          width={[1 / 2, 1 / 4]}
          p={2}
        >
          <Radio
            id={dim.label.value}
            name={dim.label.value}
            value={dim.label.value}
            checked={dim.label.value === selectedDimension}
            onClick={() => updateDimension(dim.label.value)}
          />
          {dim.label.value}
        </Label>
      ))}

      <DSChart
        dataset={dataset}
        dimensions={meta.data.dimensions}
        dimension={selectedDimension}
        measures={meta.data.measures}
      />
    </>
  ) : null;
};
