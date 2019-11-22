import React from "react";
import { ConfiguratorStateDescribingChart } from "../domain";
import { CollapsibleSection } from "./chart-controls";
import { AnnotatorTabField } from "./field";

export const ChartAnnotator = ({
  state
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  return (
    <CollapsibleSection title="Beschriftung">
      <AnnotatorTabField value={"title"}></AnnotatorTabField>
      <AnnotatorTabField value={"description"}></AnnotatorTabField>
    </CollapsibleSection>
  );
};
