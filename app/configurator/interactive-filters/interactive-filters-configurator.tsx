import { Trans } from "@lingui/macro";

import { getFieldComponentId } from "@/charts";
import { ANIMATION_FIELD_SPEC } from "@/charts/chart-config-ui-options";
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
        <SectionTitle id="controls-interactive-filters">
          <Trans id="controls.section.interactive.filters">Animations</Trans>
        </SectionTitle>
        <ControlSectionContent gap="none" px="none">
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
        <SectionTitle id="controls-interactive-filters">
          <Trans id="controls.section.interactive.filters">Animations</Trans>
        </SectionTitle>

        <ControlSectionSkeleton showTitle={false} sx={{ mt: 0 }} />
      </ControlSection>
    );
  }
};
