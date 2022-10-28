import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import { extent } from "d3";
import React, { ChangeEvent, useCallback, useEffect, useRef } from "react";

import { getFieldComponentIri, getFieldComponentIris } from "@/charts";
import { Checkbox } from "@/components/form";
import { Loading } from "@/components/hint";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { parseDate } from "@/configurator/components/ui-helpers";
import { ConfiguratorStateDescribingChart } from "@/configurator/config-types";
import {
  isDescribing,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { EditorBrush } from "@/configurator/interactive-filters/editor-time-brush";
import {
  useInteractiveDataFiltersToggle,
  useInteractiveFiltersToggle,
  useInteractiveTimeFiltersToggle,
} from "@/configurator/interactive-filters/interactive-filters-config-actions";
import { toggleInteractiveFilterDataDimension } from "@/configurator/interactive-filters/interactive-filters-config-state";
import { InteractiveFilterType } from "@/configurator/interactive-filters/interactive-filters-configurator";
import { useFormatFullDateAuto } from "@/formatters";
import {
  DimensionMetadataFragment,
  TimeUnit,
  useDataCubeMetadataWithComponentValuesQuery,
} from "@/graphql/query-hooks";
import { useLocale } from "@/locales/use-locale";

export const InteractiveFiltersOptions = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const { activeField, chartConfig, dataSet, dataSource } = state;
  const locale = useLocale();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
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

    if (activeField === "legend") {
      const componentIri = getFieldComponentIri(chartConfig.fields, "segment");
      const component = allComponents.find((d) => d.iri === componentIri);

      return (
        <ControlSection>
          <SectionTitle iconName="segments">{component?.label}</SectionTitle>
          <ControlSectionContent gap="none">
            <InteractiveFiltersToggle
              label={t({
                id: "controls.interactiveFilters.legend.toggleInteractiveLegend",
                message: "Show interactive legend",
              })}
              path="legend"
              defaultChecked={false}
              disabled={false}
            />
          </ControlSectionContent>
        </ControlSection>
      );
    } else if (activeField === "time") {
      const componentIri = getFieldComponentIri(chartConfig.fields, "x");
      const component = allComponents.find((d) => d.iri === componentIri);

      return (
        <ControlSection>
          <SectionTitle iconName="time">{component?.label}</SectionTitle>
          <ControlSectionContent gap="none">
            <InteractiveTimeFilterOptions state={state} />
          </ControlSectionContent>
        </ControlSection>
      );
    } else if (activeField === "dataFilters") {
      return (
        <ControlSection>
          <SectionTitle iconName="filter">
            <Trans id="controls.section.interactiveFilters.dataFilters">
              Data filters
            </Trans>
          </SectionTitle>
          <ControlSectionContent gap="none">
            <InteractiveDataFilterOptions state={state} />
          </ControlSectionContent>
        </ControlSection>
      );
    }
  }

  return null;
};

const InteractiveTimeFilterToggle = ({
  label,
  path,
  defaultChecked,
  disabled = false,
  timeExtent,
}: {
  label: string;
  path: "time";
  defaultChecked?: boolean;
  disabled?: boolean;
  timeExtent: string[];
}) => {
  const fieldProps = useInteractiveTimeFiltersToggle({ path, timeExtent });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    />
  );
};

const InteractiveTimeFilterOptions = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const locale = useLocale();
  const formatDateAuto = useFormatFullDateAuto();

  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
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
            <InteractiveTimeFilterToggle
              label={t({
                id: "controls.interactiveFilters.time.toggleTimeFilter",
                message: "Show time filter",
              })}
              path="time"
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
                  !state.chartConfig.interactiveFiltersConfig?.time.active ??
                  true
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

// Data Filters
const InteractiveDataFiltersToggle = ({
  label,
  path,
  defaultChecked,
  disabled = false,
  dimensions,
}: {
  label: string;
  path: "dataFilters";
  defaultChecked?: boolean;
  disabled?: boolean;
  dimensions: DimensionMetadataFragment[];
}) => {
  const fieldProps = useInteractiveDataFiltersToggle({ path, dimensions });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    />
  );
};

const InteractiveDataFilterOptions = ({
  state: { chartConfig, dataSet, dataSource },
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

  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(chartConfig.fields);

    // Dimensions that are not encoded in the visualization
    // excluding temporal and numerical dimensions
    const configurableDimensions = data.dataCubeByIri.dimensions.filter(
      (d) =>
        !mappedIris.has(d.iri) &&
        (d.__typename !== "TemporalDimension" ||
          d.timeUnit === TimeUnit.Year) &&
        !d.isNumerical
    );

    return (
      <>
        <InteractiveDataFiltersToggle
          label={t({
            id: "controls.interactiveFilters.dataFilters.toggledataFilters",
            message: "Show data filters",
          })}
          path="dataFilters"
          defaultChecked={false}
          disabled={false}
          dimensions={configurableDimensions}
        />
        <Box sx={{ my: 3 }}>
          {configurableDimensions.map((d, i) => (
            <InteractiveDataFilterOptionsCheckbox
              key={i}
              label={d.label}
              value={d.iri}
              disabled={
                !chartConfig.interactiveFiltersConfig?.dataFilters.active
              }
            />
          ))}
        </Box>
      </>
    );
  } else {
    return <Loading />;
  }
};

const InteractiveDataFilterOptionsCheckbox = ({
  value,
  label,
  disabled,
}: {
  value: string;
  label: string;
  disabled: boolean;
}) => {
  const [state, dispatch] = useConfiguratorState(isDescribing);

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      const { interactiveFiltersConfig } = state.chartConfig;
      const newIFConfig = toggleInteractiveFilterDataDimension(
        interactiveFiltersConfig,
        e.currentTarget.value
      );

      dispatch({
        type: "INTERACTIVE_FILTER_CHANGED",
        value: newIFConfig,
      });
    },
    [dispatch, state]
  );
  const checked =
    state.chartConfig.interactiveFiltersConfig?.dataFilters.componentIris?.includes(
      value
    );

  return (
    <Checkbox
      name={`interactive-filter-${label}`}
      disabled={disabled}
      label={label}
      value={value}
      checked={checked}
      onChange={onChange}
    />
  );
};

// Generic toggle
const InteractiveFiltersToggle = ({
  label,
  path,
  defaultChecked,
  disabled = false,
}: {
  label: string;
  path: InteractiveFilterType;
  defaultChecked?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useInteractiveFiltersToggle({ path });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    />
  );
};
