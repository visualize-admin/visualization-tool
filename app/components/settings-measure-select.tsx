import { Label, Radio } from "@rebass/forms";
// import { Measure } from "@zazuko/query-rdf-data-cube";
import React from "react";
import { Measure } from "@zazuko/query-rdf-data-cube";

export const SettingsMeasureSelect = ({
  label = "Dimensions",
  measures,
  selectedMeasure,
  updateMeasure
}: {
  label?: string;
  measures: Measure[];
  selectedMeasure: Measure;
  updateMeasure: (measure: Measure) => void;
}) => {
  return (
    <>
      <h3>{label}</h3>
      {measures.map(measure => (
        <Label key={measure.iri.value} width={[1]} p={1} m={0}>
          <Radio
            id={measure.iri.value}
            name={measure.iri.value}
            value={measure.iri.value}
            checked={measure.iri === selectedMeasure.iri}
            onChange={() => updateMeasure(measure)}
          />
          {measure.labels[0].value}
        </Label>
      ))}
    </>
  );
};
