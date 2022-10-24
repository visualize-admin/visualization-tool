import { Trans } from "@lingui/macro";
import * as React from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { AnnotatorTabField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { ConfiguratorStateDescribingChart } from "@/configurator/config-types";
import { InteractiveFiltersConfigurator } from "@/configurator/interactive-filters/interactive-filters-configurator";

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
        <ControlSectionContent px="small" gap="none">
          <AnnotatorTabField
            value={"title"}
            icon="text"
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
      {state.chartConfig.chartType !== "table" && (
        <InteractiveFiltersConfigurator state={state} />
      )}
    </>
  );
};
