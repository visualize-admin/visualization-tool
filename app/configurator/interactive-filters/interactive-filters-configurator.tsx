import { Trans } from "@lingui/macro";
import get from "lodash/get";
import { ReactNode, useCallback } from "react";

import { getFieldComponentIri } from "@/charts";
import { chartConfigOptionsUISpec } from "@/charts/chart-config-ui-options";
import { Loading } from "@/components/hint";
import { OnOffControlTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ConfiguratorStateDescribingChart } from "@/configurator/config-types";
import {
  isDescribing,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { useDataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export type InteractiveFilterType = "legend" | "time" | "dataFilters";

export const InteractiveFiltersConfigurator = ({
  state: {
    dataSet,
    dataSource,
    chartConfig: { chartType, fields, filters },
  },
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const xDimensionIri = getFieldComponentIri(fields, "x");
  const segmentDimensionIri = getFieldComponentIri(fields, "segment");

  if (data?.dataCubeByIri) {
    const { dimensions, measures } = data.dataCubeByIri;
    const allComponents = [...dimensions, ...measures];
    const xDimension = allComponents.find((d) => d.iri === xDimensionIri);
    const segmentDimension = allComponents.find(
      (d) => d.iri === segmentDimensionIri
    );

    const canFilterLegend =
      chartConfigOptionsUISpec[chartType].interactiveFilters.includes("legend");
    const canFilterTime =
      chartConfigOptionsUISpec[chartType].interactiveFilters.includes("time");
    const canFilterData = Object.keys(filters).length > 0;

    return (
      <ControlSection
        role="tablist"
        aria-labelledby="controls-interactive-filters"
      >
        <SectionTitle titleId="controls-interactive-filters">
          <Trans id="controls.section.interactive.filters">
            Interactive Filters
          </Trans>
        </SectionTitle>
        <ControlSectionContent px="small" gap="none">
          {/* Time */}
          {xDimension?.__typename === "TemporalDimension" && canFilterTime && (
            <InteractiveFilterTabField
              value="time"
              icon="time"
              label={xDimension.label}
            />
          )}
          {/* Legend */}
          {segmentDimension && canFilterLegend && (
            <InteractiveFilterTabField
              value="legend"
              icon="segment"
              label={segmentDimension.label}
            />
          )}
          {/* Data Filters */}
          {canFilterData && (
            <InteractiveFilterTabField
              value="dataFilters"
              icon="filter"
              label={
                <Trans id="controls.interactive.filters.dataFilter">
                  Filter Data
                </Trans>
              }
            />
          )}
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return <Loading />;
  }
};

const InteractiveFilterTabField = ({
  value,
  icon,
  label,
}: {
  value: InteractiveFilterType;
  disabled?: boolean;
  icon: string;
  label: ReactNode;
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = state.activeField === value;
  const active = get(
    state,
    `chartConfig.interactiveFiltersConfig["${value}"].active`,
    ""
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
