import { Trans } from "@lingui/macro";

import { getFieldComponentIri } from "@/charts";
import { ANIMATION_FIELD_SPEC } from "@/charts/chart-config-ui-options";
import {
  ConfiguratorStateConfiguringChart,
  isAnimationInConfig,
} from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ControlTabField } from "@/configurator/components/field";
import { useComponentsQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export type InteractiveFilterType = "legend" | "timeRange" | "dataFilters";

export const isInteractiveFilterType = (
  field: string | undefined
): field is InteractiveFilterType => {
  return field === "legend" || field === "timeRange" || field === "dataFilters";
};

export const InteractiveFiltersConfigurator = ({
  state: { dataSet, dataSource, chartConfig },
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { fields } = chartConfig;
  const locale = useLocale();
  const [{ data }] = useComponentsQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  if (data?.dataCubeByIri) {
    const { dimensions, measures } = data.dataCubeByIri;
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
        <SectionTitle
          titleId="controls-interactive-filters"
          gutterBottom={false}
        >
          <Trans id="controls.section.interactive.filters">
            Interactive Filters
          </Trans>
        </SectionTitle>
        <ControlSectionContent px="small" gap="none">
          {canFilterAnimation && (
            // Animation is technically a field, so we need to use an appropriate component.
            <ControlTabField
              component={animationComponent}
              value="animation"
              labelId={`${chartConfig.chartType}.animation`}
              warnMessage={ANIMATION_FIELD_SPEC.getWarnMessage?.(dimensions)}
            />
          )}
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
          <Trans id="controls.section.interactive.filters">
            Interactive Filters
          </Trans>
        </SectionTitle>

        <ControlSectionSkeleton showTitle={false} sx={{ mt: 0 }} />
      </ControlSection>
    );
  }
};
