import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { extent } from "d3";
import { useEffect, useRef } from "react";

import { getFieldComponentIri } from "@/charts";
import { Checkbox } from "@/components/form";
import { Loading } from "@/components/hint";
import { ConfiguratorStateConfiguringChart } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { parseDate } from "@/configurator/components/ui-helpers";
import { EditorBrush } from "@/configurator/interactive-filters/editor-time-brush";
import { useInteractiveTimeRangeFiltersToggle } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { useFormatFullDateAuto } from "@/formatters";
import { useComponentsQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const InteractiveFiltersOptions = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { chartConfig, dataSet, dataSource } = state;
  const activeField = state.activeField as InteractiveFilterType;
  const locale = useLocale();

  const [{ data }] = useComponentsQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  if (data?.dataCubeByIri) {
    const { dimensions, measures } = data.dataCubeByIri;
    const allComponents = [...dimensions, ...measures];

    if (activeField === "timeRange") {
      const componentIri = getFieldComponentIri(chartConfig.fields, "x");
      const component = allComponents.find((d) => d.iri === componentIri);

      return (
        <ControlSection>
          <SectionTitle iconName="time">{component?.label}</SectionTitle>
          <ControlSectionContent gap="none">
            <InteractiveTimeRangeFilterOptions state={state} />
          </ControlSectionContent>
        </ControlSection>
      );
    }
  }

  return null;
};

const InteractiveTimeRangeFilterToggle = ({
  label,
  defaultChecked,
  disabled = false,
  timeExtent,
}: {
  label: string;
  defaultChecked?: boolean;
  disabled?: boolean;
  timeExtent: [string, string];
}) => {
  const fieldProps = useInteractiveTimeRangeFiltersToggle({ timeExtent });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    />
  );
};

const InteractiveTimeRangeFilterOptions = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const formatDateAuto = useFormatFullDateAuto();

  const [{ data }] = useComponentsQuery({
    variables: {
      iri: state.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
    },
  });

  if (data?.dataCubeByIri) {
    const { dimensions, measures } = data.dataCubeByIri;
    const componentIri = getFieldComponentIri(state.chartConfig.fields, "x");
    const component = [...dimensions, ...measures].find(
      (d) => d.iri === componentIri
    );

    const filter = componentIri
      ? state.chartConfig.filters[componentIri]
      : undefined;
    const timeRangeFilter = filter?.type === "range" ? filter : undefined;
    const timeRange: [Date, Date] | undefined = timeRangeFilter
      ? [parseDate(timeRangeFilter.from), parseDate(timeRangeFilter.to)]
      : undefined;

    // Limit the available time range to the time range defined in the editor.
    const timeExtent: [Date, Date] | undefined = timeRange
      ? timeRange
      : component
      ? (extent(component.values, (d) => parseDate(`${d.value}`)) as [
          Date,
          Date
        ])
      : undefined;

    return (
      <>
        {timeExtent && timeExtent[0] && timeExtent[1] ? (
          <>
            <InteractiveTimeRangeFilterToggle
              label={t({
                id: "controls.interactiveFilters.time.toggleTimeFilter",
                message: "Show time filter",
              })}
              defaultChecked={false}
              disabled={false}
              timeExtent={[
                formatDateAuto(timeExtent[0]),
                formatDateAuto(timeExtent[1]),
              ]}
            />

            <Box sx={{ my: 3 }}>
              <EditorBrush
                timeExtent={timeExtent}
                timeDataPoints={component?.values}
                disabled={
                  !state.chartConfig.interactiveFiltersConfig?.timeRange
                    .active ?? true
                }
              />
            </Box>
          </>
        ) : (
          <Box>
            <Trans id="controls.interactiveFilters.time.noTimeDimension">
              There is no time dimension!
            </Trans>
          </Box>
        )}
      </>
    );
  } else {
    return <Loading />;
  }
};
