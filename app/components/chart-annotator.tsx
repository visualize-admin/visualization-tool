import { Trans } from "@lingui/macro";
import React from "react";
import {
  SectionTitle,
  ControlSectionContent,
  ControlSection
} from "./chart-controls/section";
import { AnnotatorTabField } from "./field";

export const ChartAnnotator = () => {
  return (
    <ControlSection role="tablist" aria-labelledby="controls-design">
      <SectionTitle>
        <Trans id="controls.section.description">Annotate</Trans>
      </SectionTitle>
      <ControlSectionContent side="left">
        <AnnotatorTabField value={"title"}></AnnotatorTabField>
        <AnnotatorTabField value={"description"}></AnnotatorTabField>
      </ControlSectionContent>
    </ControlSection>
  );
};
