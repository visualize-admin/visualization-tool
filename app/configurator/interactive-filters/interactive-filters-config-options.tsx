import { Trans } from "@lingui/macro";
import { extent } from "d3";
import React, {
  ChangeEvent,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Box } from "theme-ui";
import { getFieldComponentIri, getFieldComponentIris } from "../../charts";
import { Checkbox } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  ComponentFieldsFragment,
  useDataCubeMetadataWithComponentValuesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { parseDate, useFormatFullDateAuto } from "../components/ui-helpers";
import { ConfiguratorStateDescribingChart } from "../config-types";
import { useConfiguratorState } from "../configurator-state";
import { EditorBrush } from "./editor-time-brush";
import {
  useInteractiveDataFiltersToggle,
  useInteractiveFiltersToggle,
  useInteractiveTimeFiltersToggle,
} from "./interactive-filters-config-actions";
import { InteractveFilterType } from "./interactive-filters-configurator";
import { toggleInteractiveFilterDataDimension } from "./interactive-filters-config-state";

export const InteractiveFiltersOptions = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const { activeField } = state;

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  if (activeField === "legend") {
    return (
      <ControlSection>
        <SectionTitle iconName="filter">
          <Trans id="controls.section.interactiveFilters.legend">
            Interactive Legend
          </Trans>
        </SectionTitle>
        <ControlSectionContent side="right">
          <InteractiveFiltersToggle
            label={
              <Trans id="controls.interactiveFilters.legend.toggleInteractiveLegend">
                Show interactive legend
              </Trans>
            }
            path="legend"
            defaultChecked={false}
            disabled={false}
          ></InteractiveFiltersToggle>
        </ControlSectionContent>
      </ControlSection>
    );
  } else if (activeField === "time") {
    return (
      <ControlSection>
        <SectionTitle iconName="filter">
          <Trans id="controls.section.interactiveFilters.time">
            Filter time span
          </Trans>
        </SectionTitle>
        <ControlSectionContent side="right">
          {/* <InteractiveFiltersToggle
            label={
              <Trans id="controls.interactiveFilters.time.toggleTimeFilter">
                Show time filter
              </Trans>
            }
            path="time"
            defaultChecked={false}
            disabled={false}
          ></InteractiveFiltersToggle> */}
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
        <ControlSectionContent side="right">
          <InteractiveDataFilterOptions state={state} />
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return null;
  }
};

// Time Filter

const InteractiveTimeFilterToggle = ({
  label,
  path,
  defaultChecked,
  disabled = false,
  timeExtent,
}: {
  label: string | ReactNode;
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
    ></Checkbox>
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
    variables: { iri: state.dataSet, locale },
  });

  // FIXME: this binds "time" to field "x"
  const timeDimensionIri = getFieldComponentIri(state.chartConfig.fields, "x");

  if (data?.dataCubeByIri) {
    const timeDimension = data?.dataCubeByIri.dimensions.find(
      (dim) => dim.iri === timeDimensionIri
    );

    const timeExtent = timeDimension?.values
      ? extent(timeDimension?.values, (d) => parseDate(d.value.toString()))
      : undefined;

    return (
      <>
        {timeExtent && timeExtent[0] && timeExtent[1] ? (
          <>
            <InteractiveTimeFilterToggle
              label={
                <Trans id="controls.interactiveFilters.time.toggleTimeFilter">
                  Show time filter
                </Trans>
              }
              path="time"
              defaultChecked={false}
              disabled={false}
              timeExtent={[
                formatDateAuto(timeExtent[0]),
                formatDateAuto(timeExtent[1]),
              ]}
            ></InteractiveTimeFilterToggle>

            {
              // Mini Brush
              <Box sx={{ my: 3 }}>
                <EditorBrush timeExtent={timeExtent} />
              </Box>
            }
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
  label: string | ReactNode;
  path: "dataFilters";
  defaultChecked?: boolean;
  disabled?: boolean;
  dimensions: ComponentFieldsFragment[];
}) => {
  const fieldProps = useInteractiveDataFiltersToggle({
    path,
    dimensions,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    ></Checkbox>
  );
};

const InteractiveDataFilterOptions = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });
  const { chartConfig } = state;
  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);

    // Dimensions that are not encoded in the visualization
    const unMappedDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri)
    );

    return (
      <>
        <InteractiveDataFiltersToggle
          label={
            <Trans id="controls.interactiveFilters.dataFilters.toggledataFilters">
              Show data filters
            </Trans>
          }
          path="dataFilters"
          defaultChecked={false}
          disabled={false}
          dimensions={unMappedDimensions}
        ></InteractiveDataFiltersToggle>
        <Box sx={{ my: 3 }}>
          {unMappedDimensions.map((d, i) => (
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
  const [state, dispatch] = useConfiguratorState();

  const onChange = useCallback<(e: ChangeEvent<HTMLInputElement>) => void>(
    (e) => {
      if (state.state === "DESCRIBING_CHART") {
        const { interactiveFiltersConfig } = state.chartConfig;
        const newIFConfig = toggleInteractiveFilterDataDimension(
          interactiveFiltersConfig,
          e.currentTarget.value
        );

        dispatch({
          type: "INTERACTIVE_FILTER_CHANGED",
          value: newIFConfig,
        });
      }
    },
    [dispatch, state]
  );
  const checked =
    state.state === "DESCRIBING_CHART"
      ? state.chartConfig.interactiveFiltersConfig?.dataFilters.componentIris?.includes(
          value
        )
      : false;

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      value={value}
      checked={checked}
      onChange={onChange}
    ></Checkbox>
  );
};

// Generic toggle
const InteractiveFiltersToggle = ({
  label,
  path,
  defaultChecked,
  disabled = false,
}: {
  label: string | ReactNode;
  path: InteractveFilterType;
  defaultChecked?: boolean;
  disabled?: boolean;
}) => {
  const fieldProps = useInteractiveFiltersToggle({
    path,
  });

  return (
    <Checkbox
      disabled={disabled}
      label={label}
      {...fieldProps}
      checked={fieldProps.checked ?? defaultChecked}
    ></Checkbox>
  );
};
