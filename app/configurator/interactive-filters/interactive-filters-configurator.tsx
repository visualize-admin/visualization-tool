import { Trans } from "@lingui/macro";
import { FormControlLabel, Switch, Typography } from "@mui/material";

import { getFieldComponentId } from "@/charts";
import { ANIMATION_FIELD_SPEC } from "@/charts/chart-config-ui-options";
import { MaybeTooltip } from "@/components/maybe-tooltip";
import {
  ConfiguratorStateConfiguringChart,
  isAnimationInConfig,
} from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ControlTabField } from "@/configurator/components/field";
import { useDataCubesComponentsQuery } from "@/graphql/hooks";
import { useLocale } from "@/locales/use-locale";

export const InteractiveFiltersConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { dataSource } = state;
  const chartConfig = getChartConfig(state);
  const { fields } = chartConfig;
  const locale = useLocale();
  const [{ data }] = useDataCubesComponentsQuery({
    variables: {
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      cubeFilters: chartConfig.cubes.map((cube) => ({
        iri: cube.iri,
        joinBy: cube.joinBy,
        loadValues: true,
      })),
    },
  });

  if (data?.dataCubesComponents) {
    const { dimensions, measures } = data.dataCubesComponents;
    const allComponents = [...dimensions, ...measures];

    const animationComponent = allComponents.find(
      (d) => d.id === getFieldComponentId(fields, "animation")
    );
    const canFilterAnimation = isAnimationInConfig(chartConfig);

    if (!canFilterAnimation) {
      return null;
    }

    return (
      <ControlSection
        role="tablist"
        aria-labelledby="controls-interactive-filters"
        collapse
        defaultExpanded={false}
      >
        <SubsectionTitle
          titleId="controls-interactive-filters"
          gutterBottom={false}
        >
          <Trans id="controls.section.interactive.filters">Animations</Trans>
        </SubsectionTitle>
        <ControlSectionContent px="small" gap="none">
          {/* Animation is technically a field, so we need to use an appropriate component. */}
          <ControlTabField
            chartConfig={chartConfig}
            fieldComponents={animationComponent ? [animationComponent] : []}
            value="animation"
            labelId={null}
            {...ANIMATION_FIELD_SPEC.getDisabledState?.(
              chartConfig,
              dimensions,
              []
            )}
          />
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return (
      <ControlSection
        role="tablist"
        aria-labelledby="controls-interactive-filters"
        collapse
        defaultExpanded={false}
      >
        <SectionTitle
          titleId="controls-interactive-filters"
          gutterBottom={false}
        >
          <Trans id="controls.section.interactive.filters">Animations</Trans>
        </SectionTitle>

        <ControlSectionSkeleton showTitle={false} sx={{ mt: 0 }} />
      </ControlSection>
    );
  }
};

type InteractiveFilterToggleProps = {
  checked: boolean | undefined;
  toggle: () => void;
};

export const InteractiveFilterToggle = (
  props: InteractiveFilterToggleProps
) => {
  const { checked, toggle } = props;
  return (
    <FormControlLabel
      componentsProps={{
        typography: { variant: "caption", color: "text.secondary" },
      }}
      control={<Switch checked={checked} onChange={() => toggle()} />}
      label={
        <MaybeTooltip
          tooltipProps={{ enterDelay: 600 }}
          title={
            <Trans id="controls.filters.interactive.tooltip">
              Allow users to change filters
            </Trans>
          }
        >
          <Typography variant="body2">
            <Trans id="controls.filters.interactive.toggle">Interactive</Trans>
          </Typography>
        </MaybeTooltip>
      }
    />
  );
};
