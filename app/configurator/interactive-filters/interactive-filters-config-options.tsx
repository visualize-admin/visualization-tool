import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { extent } from "d3";
import get from "lodash/get";
import { useEffect, useMemo, useRef } from "react";

import { getFieldComponentIri } from "@/charts";
import { Checkbox, Select } from "@/components/form";
import { Loading } from "@/components/hint";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { parseDate } from "@/configurator/components/ui-helpers";
import { ConfiguratorStateConfiguringChart } from "@/configurator/config-types";
import { EditorBrush } from "@/configurator/interactive-filters/editor-time-brush";
import {
  useInteractiveTimeRangeFiltersToggle,
  useInteractiveTimeSliderFiltersSelect,
} from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { useFormatFullDateAuto } from "@/formatters";
import { TemporalDimension, useComponentsQuery } from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

import { FIELD_VALUE_NONE } from "../constants";

import { getTimeSliderFilterDimensions } from "./helpers";

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
    } else if (activeField === "timeSlider") {
      return (
        <ControlSection>
          <SectionTitle iconName="play">
            <Trans id="controls.interactive.filters.timeSlider">
              Time slider
            </Trans>
          </SectionTitle>
          <ControlSectionContent gap="none">
            <InteractiveTimeSliderFilterOptions state={state} />
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

    const hardFilters = componentIri
      ? state.chartConfig.filters[componentIri]
      : undefined;
    const hardFiltersValues =
      hardFilters?.type === "multi" ? hardFilters.values ?? false : false;
    // Time extent uses the "hard filters" (filters defined in the editor)
    // and defaults to full time extent (from dimension metadata).
    const timeExtent = hardFiltersValues
      ? extent(Object.keys(hardFiltersValues), (d) => parseDate(d.toString()))
      : component
      ? extent(component?.values, (d) => parseDate(d.value.toString()))
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

const InteractiveTimeSliderFilterOptions = ({
  state: { chartConfig, dataSet, dataSource },
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useComponentsQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const value =
    get(chartConfig, "interactiveFiltersConfig.timeSlider.componentIri") ||
    FIELD_VALUE_NONE;

  if (data?.dataCubeByIri) {
    const timeSliderDimensions = getTimeSliderFilterDimensions({
      chartConfig,
      dataCubeByIri: data.dataCubeByIri,
    });

    return (
      <InteractiveTimeSliderFilterOptionsSelect
        dimensions={timeSliderDimensions}
        value={value}
      />
    );
  } else {
    return <Loading />;
  }
};

const InteractiveTimeSliderFilterOptionsSelect = ({
  dimensions,
  value,
}: {
  dimensions: TemporalDimension[];
  value: string;
}) => {
  const fieldProps = useInteractiveTimeSliderFiltersSelect();
  const options = useMemo(() => {
    return [
      {
        label: t({
          id: "controls.none",
          message: "None",
        }),
        value: FIELD_VALUE_NONE,
        isNoneValue: true,
      },
      ...dimensions.map((d) => ({
        label: d.label,
        value: d.iri,
      })),
    ];
  }, [dimensions]);

  return (
    <Select
      id="time-slider-component-iri"
      options={options}
      label={t({
        id: "controls.select.dimension",
        message: "Select a dimension",
      })}
      value={value}
      displayEmpty={true}
      {...fieldProps}
    />
  );
};
