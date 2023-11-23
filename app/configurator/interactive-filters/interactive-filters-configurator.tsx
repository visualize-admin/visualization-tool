import { Trans } from "@lingui/macro";

import { getFieldComponentIri } from "@/charts";
import { ANIMATION_FIELD_SPEC } from "@/charts/chart-config-ui-options";
import {
  ConfiguratorStateConfiguringChart,
  getChartConfig,
  isAnimationInConfig,
} from "@/config-types";
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

export type InteractiveFilterType = "legend" | "timeRange" | "dataFilters";

export const isInteractiveFilterType = (
  field: string | undefined
): field is InteractiveFilterType => {
  return ["legend", "timeRange", "dataFilters"].includes(field ?? "");
};

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
      cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
    },
  });

  if (data?.dataCubesComponents) {
    const { dimensions, measures } = data.dataCubesComponents;
    const allComponents = [...dimensions, ...measures];

    const animationComponent = allComponents.find(
      (d) => d.iri === getFieldComponentIri(fields, "animation")
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
            component={animationComponent}
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
