import { Label, Radio } from "@rebass/forms";
import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";

export const DSDimensionSelect = ({
  dimensions,
  selectedDimension,
  updateDimension
}: {
  dimensions: Dimension[];
  selectedDimension: string;
  updateDimension: (dimension: string) => void;
}) => {
  return (
    <>
      <h3>Dimensions</h3>
      {dimensions.map(dim => (
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
    </>
  );
};
