import { Trans } from "@lingui/macro";
import React from "react";
import {
  SectionTitle,
  ControlSectionContent,
  ControlSection,
} from "./chart-controls/section";
import { AnnotatorTabField } from "./field";
import { getFieldLabel } from "./ui-helpers";

export const ChartAnnotator = () => {
  return (
    <ControlSection role="tablist" aria-labelledby="controls-design">
      <SectionTitle>
        <Trans id="controls.section.description">Annotate</Trans>
      </SectionTitle>
      <ControlSectionContent side="left">
        <AnnotatorTabField
          value={"title"}
          icon="title"
          label={getFieldLabel("title")}
        ></AnnotatorTabField>
        <AnnotatorTabField
          value={"description"}
          icon="description"
          label={getFieldLabel("description")}
        ></AnnotatorTabField>
      </ControlSectionContent>
    </ControlSection>
  );
};
