import { t, Trans } from "@lingui/macro";
import React, { memo } from "react";
import { ConfiguratorStateConfiguringChart, MapConfig } from "..";
import { DataCubeMetadata } from "../../graphql/types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import {
  ChartOptionCheckboxField,
  ChartOptionSelectField,
} from "../components/field";

export const MapColumnOptions = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const chartConfig = state.chartConfig as MapConfig;
  const { activeField } = state;

  switch (activeField) {
    case "settings":
      return <BaseLayersSettings />;
    case "areaLayer":
      return (
        <AreaLayerSettings
          activeField={activeField}
          chartConfig={chartConfig}
          metaData={metaData}
        />
      );
    default:
      return null;
  }
};

export const BaseLayersSettings = memo(() => {
  return (
    <ControlSection>
      <SectionTitle iconName={"settings"}>
        <Trans id="controls.section.mapSettings">Map Settings</Trans>
      </SectionTitle>
      <ControlSectionContent side="right">
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

export const AreaLayerSettings = memo(
  ({
    activeField,
    chartConfig,
    metaData,
  }: {
    activeField: string;
    chartConfig: MapConfig;
    metaData: DataCubeMetadata;
  }) => {
    return (
      <>
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
              field={"areaLayer"}
              path="show"
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName={"settings"}>
            Geographical dimension
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.componentIri"
              label="Select a dimension"
              field={activeField}
              path="fields.areaLayer.componentIri"
              options={metaData.dimensions
                .filter((d) => d.__typename === "GeoDimension")
                .map((d) => ({ value: d.iri, label: d.label }))}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName={"settings"}>Measure</SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.componentIri"
              label="Select a measure"
              field={activeField}
              path="measureIri"
              options={metaData.measures.map((d) => ({
                value: d.iri,
                label: d.label,
              }))}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName={"settings"}>Color palette</SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.palette"
              label="Select a color palette"
              field={activeField}
              path="palette"
              options={[
                "oranges",
                "reds",
                "purples",
                "greens",
                "blues",
                "greys",
              ].map((d) => ({
                value: d,
                label: d,
              }))}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  }
);
