import { Trans, t } from "@lingui/macro";
import * as React from "react";

import { getChartConfig } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { AnnotatorTabField } from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { isConfiguring } from "@/configurator/configurator-state";
import { useConfiguratorState, useLocale } from "@/src";

export const TitleAndDescriptionConfigurator = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);
  const { title, description } = chartConfig.meta;
  const locale = useLocale();
  const disabled = React.useMemo(() => {
    return !(title[locale] !== "" && description[locale] !== "");
  }, [title, description, locale]);

  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-design"
      collapse
      defaultExpanded={false}
    >
      <SubsectionTitle
        titleId="controls-design"
        disabled={disabled}
        warnMessage={
          disabled
            ? t({
                id: "controls.section.title.warning",
                message: "Please add a title or description.",
              })
            : undefined
        }
        gutterBottom={false}
      >
        <Trans id="controls.section.description">Title & Description</Trans>
      </SubsectionTitle>
      <ControlSectionContent px="small" gap="none">
        <AnnotatorTabField
          value="title"
          icon="text"
          emptyValueWarning={
            <Trans id="controls.annotator.add-title-warning">
              Please add a title
            </Trans>
          }
          mainLabel={getFieldLabel("title")}
        />
        <AnnotatorTabField
          value="description"
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
