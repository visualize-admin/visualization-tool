import React from "react";
import { ConfiguratorStateDescribingChart } from "../domain";
import { CollapsibleSection } from "./chart-controls";
import { AnnotatorTabField } from "./field";
import { Trans } from "@lingui/macro";

export const ChartAnnotator = ({
  state
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  return (
    <CollapsibleSection title={<Trans>Description</Trans>}>
      <AnnotatorTabField value={"title"}></AnnotatorTabField>
      <AnnotatorTabField value={"description"}></AnnotatorTabField>
    </CollapsibleSection>
  );
};
