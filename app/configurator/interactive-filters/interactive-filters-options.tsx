import { Trans } from "@lingui/macro";
import React, { ReactNode, useEffect, useRef } from "react";
import { Box } from "theme-ui";
import { getFieldComponentIris } from "../../charts";
import { useInteractiveFilters } from "../../charts/shared/use-interactive-filters";
import { Checkbox } from "../../components/form";
import { Loading } from "../../components/hint";
import {
  useDataCubeMetadataWithComponentValuesQuery,
  useDimensionValuesQuery,
} from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { ConfiguratorStateDescribingChart } from "../config-types";
import {
  useInteractiveDataFilterDimensionToggle,
  useInteractiveFiltersToggle,
} from "./interactive-filters-actions";
import { InteractveFilterType } from "./interactive-filters-configurator";

export const InteractiveFiltersOptions = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const { activeField, chartConfig } = state;
  console.log(chartConfig);

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
          <InteractiveFiltersToggle
            label={
              <Trans id="controls.interactiveFilters.time.toggleTimeFilter">
                Show time filter
              </Trans>
            }
            path="time"
            defaultChecked={false}
            disabled={false}
          ></InteractiveFiltersToggle>
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
          <InteractiveFiltersToggle
            label={
              <Trans id="controls.interactiveFilters.dataFilters.toggledataFilters">
                Show data filters
              </Trans>
            }
            path="dataFilters"
            defaultChecked={false}
            disabled={false}
          ></InteractiveFiltersToggle>

          <InteractiveDataFilterOptions state={state} />
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return <Box></Box>;
  }
};

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

const InteractiveDataFilterOptions = ({
  state,
}: {
  state: ConfiguratorStateDescribingChart;
}) => {
  const fieldProps = useInteractiveDataFilterDimensionToggle({
    path: "dataFilters",
  });
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });
  const { chartConfig } = state;
  if (chartConfig.chartType !== "table" && data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const unMappedDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri)
    );

    return (
      <Box sx={{ my: 3 }}>
        {/* Get unencoded dimensions */}
        {unMappedDimensions.map((d) => (
          <Checkbox
            disabled={chartConfig.interactiveFiltersConfig.dataFilters.active}
            label={d.label}
            value={d.iri}
            {...fieldProps}
            checked={true}
          ></Checkbox>
        ))}
      </Box>
    );
  } else {
    return <Loading />;
  }
};
