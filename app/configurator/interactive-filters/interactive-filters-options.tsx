import { Trans } from "@lingui/macro";
import React, { useEffect, useRef } from "react";
import { Box } from "theme-ui";
import { DataCubeMetadata } from "../../graphql/types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { getIconName } from "../components/ui-helpers";
import { ConfiguratorStateDescribingChart } from "../config-types";

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
        disabled={chartConfig.interactiveFilters.legend.active}
      />
    );
  } else if (activeField === "time") {
    const isActive = chartConfig.interactiveFilters.time.active;
    return (
      <div
        key={`control-panel-table-column-${activeField}`}
        role="tabpanel"
        id={`control-panel-table-column-${activeField}`}
        aria-labelledby={`tab-${activeField}`}
        ref={panelRef}
        tabIndex={-1}
      >
        <ControlSection>
          <SectionTitle disabled={isActive} iconName="filter">
            <Trans id="controles.section.interactiveFilters.time">Filter</Trans>
          </SectionTitle>
          <ControlSectionContent side="right">woih</ControlSectionContent>
        </ControlSection>
      </div>
    );
  } else {
    return <Box>NOTHING</Box>;
  }
};

const InteractiveFiltersLegendOptions = ({
  isActive,
}: {
  isActive: boolean;
}) => {
  return (
    <ControlSection>
      <SectionTitle disabled={isActive} iconName="filter">
        <Trans id="controles.section.interactiveFilters.legend">
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
