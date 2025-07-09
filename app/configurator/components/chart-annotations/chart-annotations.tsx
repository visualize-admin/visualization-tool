import { Trans } from "@lingui/macro";
import { Typography } from "@mui/material";

import { Markdown } from "@/components/markdown";
import { Annotation, supportsAnnotations } from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { AddAnnotationButton } from "@/configurator/components/chart-annotations/add-annotation-button";
import { ControlTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { Icon } from "@/icons";
import { useLocale } from "@/locales/use-locale";
import { useEvent } from "@/utils/use-event";

export const ChartAnnotations = () => {
  const [state] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  if (!supportsAnnotations(chartConfig)) {
    return null;
  }

  return (
    <ControlSection
      role="tablist"
      aria-labelledby="controls-annotations"
      collapse
      defaultExpanded={false}
    >
      <SectionTitle id="controls-annotations">
        <Trans id="controls.section.annotations">Annotations</Trans>
      </SectionTitle>
      <ControlSectionContent gap="none" px="none">
        {chartConfig.annotations.map((annotation) => (
          <ChartAnnotationTab key={annotation.key} annotation={annotation} />
        ))}
        <AddAnnotationButton />
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartAnnotationTab = ({ annotation }: { annotation: Annotation }) => {
  const locale = useLocale();
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = getChartConfig(state);

  const label = annotation.text[locale];
  const value = chartConfig.activeField ?? "";

  const handleClick = useEvent(() => {
    dispatch({
      type: "CHART_ACTIVE_FIELD_CHANGED",
      value: annotation.key,
    });
  });

  return (
    <ControlTab
      mainLabel={<Markdown>{label}</Markdown>}
      icon="text"
      rightIcon={
        <Typography component="span" color="text.primary">
          <Icon name="pen" />
        </Typography>
      }
      value={value}
      onClick={handleClick}
    />
  );
};
