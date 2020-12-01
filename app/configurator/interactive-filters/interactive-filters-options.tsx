import { Trans } from "@lingui/macro";
import React, { ReactNode, useEffect, useRef } from "react";
import { Box } from "theme-ui";
import { Checkbox } from "../../components/form";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { ConfiguratorStateDescribingChart } from "../config-types";
import { useInteractiveFiltersToggle } from "./interactive-filters-actions";

export const InteractiveFiltersOptions = ({
  state,
}: // metaData,
{
  state: ConfiguratorStateDescribingChart;
  // metaData: DataCubeMetadata;
}) => {
  const { activeField, chartConfig } = state;

  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [activeField]);

  // FIXME: add other chart types
  if (!activeField || chartConfig.chartType !== "line") {
    return null;
  }

  if (activeField === "legend") {
    return (
      <InteractiveFiltersLegendOptions
        isActive={chartConfig.interactiveFilters.legend.active}
      />
    );
  } else if (activeField === "time") {
    return (
      <ControlSection>
        <SectionTitle iconName="filter">
          <Trans id="controls.section.interactiveFilters.time">Filter</Trans>
        </SectionTitle>
        <ControlSectionContent side="right">
          <InteractiveFiltersTimeToggle
            label={
              <Trans id="controls.interactiveFilters.time.toggleTimeFilter">
                Show time filter
              </Trans>
            }
            path="time"
            defaultChecked={false}
            disabled={false}
          ></InteractiveFiltersTimeToggle>
        </ControlSectionContent>
      </ControlSection>
    );
  } else {
    return <Box>NOTHING</Box>;
  }
};

// Time
const InteractiveFiltersTimeToggle = ({
  label,
  path,
  defaultChecked,
  disabled = false,
}: // metaData,
{
  label: string | ReactNode;
  path: "legend" | "time";
  defaultChecked?: boolean;
  disabled?: boolean;
  // metaData: DataCubeMetadata;
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
// Legend
const InteractiveFiltersLegendOptions = ({
  isActive,
}: {
  isActive: boolean;
}) => {
  return (
    <ControlSection>
      <SectionTitle disabled={isActive} iconName="filter">
        <Trans id="controls.section.interactiveFilters.legend">
          Interactive Legend
        </Trans>
      </SectionTitle>
      <ControlSectionContent side="right">
        <Trans id="controls.hint.interactiveFilters.legend">
          Mit Aktivierung dieses Filters erlauben Sie dem Enduser mit Klick auf
          die Forstzonen-Labels diese im veröffentlichten Diagrammtyp nach
          Belieben ein- und auszublenden
        </Trans>
      </ControlSectionContent>
    </ControlSection>
  );
};
