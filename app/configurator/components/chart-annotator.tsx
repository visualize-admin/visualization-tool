import { Trans } from "@lingui/macro";
import { Tooltip, Typography } from "@mui/material";
import * as React from "react";

import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { AnnotatorTabField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { InteractiveFiltersConfigurator } from "@/configurator/interactive-filters/interactive-filters-configurator";
import SvgIcWarning from "@/icons/components/IcWarning";
import { useConfiguratorState } from "@/src";

import { ConfiguratorStateConfiguringChart } from "../config-types";
import { isConfiguring } from "../configurator-state";

const WarnTitleDescription = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const hasSomeTitleOrDescription = React.useMemo(() => {
    const { title, description } = state.meta;
    return (
      Object.values(title).some((x) => x != "") ||
      Object.values(description).some((x) => x != "")
    );
  }, [state.meta]);
  return hasSomeTitleOrDescription ? null : (
    <Tooltip
      arrow
      title={
        <Trans id="controls.section.title.warning">
          Your chart has no title or description.
        </Trans>
      }
    >
      <Typography color="error">
        <SvgIcWarning />
      </Typography>
    </Tooltip>
  );
};

export const TitleAndDescriptionConfigurator = () => {
  return (
    <ControlSection role="tablist" aria-labelledby="controls-design">
      <SectionTitle titleId="controls-design" right={<WarnTitleDescription />}>
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
  );
};

export const ChartAnnotator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  return (
    <>
      {/* Title & Description */}
      <TitleAndDescriptionConfigurator />
      {/* Filters */}
      {state.chartConfig.chartType !== "table" && (
        <InteractiveFiltersConfigurator state={state} />
      )}
    </>
  );
};
