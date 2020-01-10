import { Trans } from "@lingui/macro";
import React from "react";
import { Box } from "@theme-ui/components";
import { SectionTitle } from "./chart-controls";
import { AnnotatorTabField } from "./field";

export const ChartAnnotator = () => {
  return (
    <Box
      role="tablist"
      aria-labelledby="controls-design"
      variant="controlSection"
    >
      <SectionTitle>
        <Trans id="controls.section.description">Description</Trans>
      </SectionTitle>
      <Box variant="leftControlSectionContent">
        <AnnotatorTabField value={"title"}></AnnotatorTabField>
        <AnnotatorTabField value={"description"}></AnnotatorTabField>
      </Box>
    </Box>
  );
};
