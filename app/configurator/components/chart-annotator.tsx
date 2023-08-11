import { Trans } from "@lingui/macro";
import { Tooltip, Typography } from "@mui/material";
import * as React from "react";

import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { AnnotatorTabField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import SvgIcExclamation from "@/icons/components/IcExclamation";
import { useConfiguratorState, useLocale } from "@/src";

import { isConfiguring } from "../configurator-state";

const WarnTitleDescription = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const locale = useLocale();
  const hasSomeTitleOrDescription = React.useMemo(() => {
    const { title, description } = state.meta;
    return title[locale] !== "" && description[locale] !== "";
  }, [state.meta, locale]);
  return hasSomeTitleOrDescription ? null : (
    <Tooltip
      arrow
      title={
        <Trans id="controls.section.title.warning">
          Please add a title or description.
        </Trans>
      }
    >
      <Typography color="warning.main" sx={{ mr: 2 }}>
        <SvgIcExclamation width={18} height={18} />
      </Typography>
    </Tooltip>
  );
};

export const TitleAndDescriptionConfigurator = () => {
  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-design"
      collapse
      defaultExpanded={false}
    >
      <SubsectionTitle
        titleId="controls-design"
        gutterBottom={false}
        right={<WarnTitleDescription />}
      >
        <Trans id="controls.section.description">Title & Description</Trans>
      </SubsectionTitle>
      <ControlSectionContent px="small" gap="none">
        <AnnotatorTabField
          value={"title"}
          icon="text"
          emptyValueWarning={
            <Trans id="controls.annotator.add-title-warning">
              Please add a title
            </Trans>
          }
          mainLabel={getFieldLabel("title")}
        />
        <AnnotatorTabField
          value={"description"}
          icon="description"
          emptyValueWarning={
            <Trans id="controls.annotator.add-description-warning">
              Please add a description
            </Trans>
          }
          mainLabel={getFieldLabel("description")}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};
