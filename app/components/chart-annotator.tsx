import { Trans } from "@lingui/macro";
import React from "react";
import { Box } from "rebass";
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
        <Trans>Description</Trans>
      </SectionTitle>
      <Box variant="controlSectionContent">
        <AnnotatorTabField value={"title"}></AnnotatorTabField>
        <AnnotatorTabField value={"description"}></AnnotatorTabField>
      </Box>
    </Box>
  );
};
