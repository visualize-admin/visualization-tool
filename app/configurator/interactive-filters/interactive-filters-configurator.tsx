import { Trans } from "@lingui/macro";
import get from "lodash/get";
import { ReactNode, useCallback } from "react";

import { getFieldComponentIri } from "@/charts";
import { chartConfigOptionsUISpec } from "@/charts/chart-config-ui-options";
import { OnOffControlTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ConfiguratorStateConfiguringChart } from "@/configurator/config-types";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { isTemporalDimension } from "@/domain/data";
import { flag } from "@/flags/flag";
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
  const { chartType, fields } = chartConfig;
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

    const xComponentIri = getFieldComponentIri(fields, "x");
    const xComponent = allComponents.find((d) => d.iri === xComponentIri);

    const canFilterTimeRange =
      isTemporalDimension(xComponent) &&
      chartConfigOptionsUISpec[chartType].interactiveFilters.includes(
        "timeRange"
      );

    if (!canFilterTimeRange) {
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
          {/* Time range */}
          {canFilterTimeRange && (
            <InteractiveFilterTabField
              value="timeRange"
              icon="time"
              label={xComponent!.label}
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

const InteractiveFilterTabField = ({
  value,
  icon,
  label,
}: {
  value: InteractiveFilterType;
  icon: string;
  label: ReactNode;
}) => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = state.activeField === value;
  const active = !!get(
    state,
    `chartConfig.interactiveFiltersConfig["${value}"].active`
  );

  return (
    <OnOffControlTab
      value={value}
      label={label}
      icon={icon}
      checked={checked}
      active={active}
      onClick={onClick}
    />
  );
};
