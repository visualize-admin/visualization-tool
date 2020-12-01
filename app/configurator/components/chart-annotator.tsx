import { Trans } from "@lingui/macro";
import * as React from "react";
import { ConfiguratorStateDescribingChart } from "../config-types";
import { InteractiveFiltersConfigurator } from "../interactive-filters/interactive-filters-configurator";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import { AnnotatorTabField } from "./field";
import { getFieldLabel } from "./ui-helpers";

export const ChartAnnotator = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  return (
    <>
      {/* Title & Description */}
      <ControlSection role="tablist" aria-labelledby="controls-design">
        <SectionTitle titleId="controls-design">
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

      {/* Filters */}
      <InteractiveFiltersConfigurator state={state} />
    </>
  );
};
