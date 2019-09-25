import { Label, Radio } from "@rebass/forms";
import { Dimension } from "@zazuko/query-rdf-data-cube";
import React from "react";

export const SettingsDimensionSelect = ({
  label = "Dimensions",
  dimensions,
  selectedDimension,
  updateDimension
}: {
  label?: string;
  dimensions: Dimension[];
  selectedDimension: Dimension;
  updateDimension: (dimension: Dimension) => void;
}) => {
  return (
    <>
      <h3>{label}</h3>
      {dimensions.map(dim => (
        <Label key={dim.iri.value} width={[1]} p={1} m={0}>
          <Radio
            id={dim.iri.value}
            name={dim.iri.value}
            value={dim.iri.value}
            checked={dim.iri === selectedDimension.iri}
            onChange={() => updateDimension(dim)}
          />
          {dim.labels[0].value}
        </Label>
      ))}
    </>
  );
};
