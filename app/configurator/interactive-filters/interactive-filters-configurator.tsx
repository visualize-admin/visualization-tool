import { Trans } from "@lingui/macro";
import get from "lodash/get";
import { ReactNode, useCallback } from "react";

import { getFieldComponentIri } from "@/charts";
import { chartConfigOptionsUISpec } from "@/charts/chart-config-ui-options";
import { useDataSource } from "@/components/data-source-menu";
import { Loading } from "@/components/hint";
import { OnOffControlTab } from "@/configurator/components/chart-controls/control-tab";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ConfiguratorStateDescribingChart } from "@/configurator/config-types";
import { useConfiguratorState } from "@/configurator/configurator-state";
import { useDataCubeMetadataWithComponentValuesQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export type InteractiveFilterType = "legend" | "time" | "dataFilters";

export const InteractiveFiltersConfigurator = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const [dataSource] = useDataSource();
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, dataSource, locale },
  });
  const timeDimensionIri = getFieldComponentIri(state.chartConfig.fields, "x");
  const segmentDimensionIri = getFieldComponentIri(
    state.chartConfig.fields,
    "segment"
  );
  if (data?.dataCubeByIri) {
    // Are dimensions available?
    const timeDimension = data?.dataCubeByIri.dimensions.find(
      (dim) => dim.iri === timeDimensionIri
    );
    const segmentDimension = data?.dataCubeByIri.dimensions.find(
      (dim) => dim.iri === segmentDimensionIri
    );

    // Can chart type have these filter options?
    const canFilterLegend =
      chartConfigOptionsUISpec[
        state.chartConfig.chartType
      ].interactiveFilters.includes("legend");
    const canFilterTime =
      chartConfigOptionsUISpec[
        state.chartConfig.chartType
      ].interactiveFilters.includes("time");
    const canFilterData = Object.keys(state.chartConfig.filters).length > 0;
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
        <ControlSectionContent side="left">
          {/* Time */}
          {timeDimension &&
            timeDimension.__typename === "TemporalDimension" &&
            canFilterTime && (
              <InteractiveFilterTabField
                value="time"
                icon="time"
                label={timeDimension.label}
              ></InteractiveFilterTabField>
            )}
          {/* Legend */}
          {segmentDimension && canFilterLegend && (
            <InteractiveFilterTabField
              value="legend"
              icon="segment"
              label={segmentDimension.label}
            ></InteractiveFilterTabField>
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
            ></InteractiveFilterTabField>
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
  const [state, dispatch] = useConfiguratorState();

  const onClick = useCallback(() => {
    dispatch({
      type: "ACTIVE_FIELD_CHANGED",
      value,
    });
  }, [dispatch, value]);

  const checked = state.activeField === value;
  const active =
    state.state === "DESCRIBING_CHART"
      ? get(
          state,
          `chartConfig.interactiveFiltersConfig["${value}"].active`,
          ""
        )
      : "";

  return (
    <OnOffControlTab
      value={`${value}`}
      label={label}
      icon={icon}
      checked={checked}
      active={active}
      onClick={onClick}
    />
  );
};
