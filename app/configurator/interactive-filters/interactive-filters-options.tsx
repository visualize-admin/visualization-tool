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
  if (!activeField) {
    return null;
  }

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
          <Trans id="controls.section.interactiveFilters.time">Filter</Trans>
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
  } else {
    return <Box>NOTHING</Box>;
  }
};

// Time
const InteractiveFiltersToggle = ({
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
