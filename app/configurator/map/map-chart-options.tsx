import { t, Trans } from "@lingui/macro";
import React, { memo } from "react";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import { ChartOptionCheckboxField } from "../components/field";

export const MapSettings = memo(() => {
  return (
    <ControlSection>
      <SectionTitle iconName={"settings"}>
        <Trans id="controls.section.mapSettings">Map Settings</Trans>
      </SectionTitle>
      <ControlSectionContent side="right">
        <ChartOptionCheckboxField
          label={t({
            id: "fields.areaLayer.show",
            message: "Show areaLayer",
          })}
          field={null}
          path="fields.areaLayer.show"
        />
        <ChartOptionCheckboxField
          label={t({
            id: "controls.mapSettings.showRelief",
            message: "Show relief",
          })}
          field={null}
          path="settings.showRelief"
        />
        <ChartOptionCheckboxField
          label={t({
            id: "controls.mapSettings.showLakes",
            message: "Show lakes",
          })}
          field={null}
          path="settings.showLakes"
        />
      </ControlSectionContent>
    </ControlSection>
  );
});
