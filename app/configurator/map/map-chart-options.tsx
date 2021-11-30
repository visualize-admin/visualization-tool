import { t, Trans } from "@lingui/macro";
import React, { memo } from "react";
import { ConfiguratorStateConfiguringChart, MapConfig } from "..";
import { FieldSetLegend } from "../../components/form";
import { DataCubeMetadata } from "../../graphql/types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "../components/chart-controls/section";
import {
  ChartOptionCheckboxField,
  ChartOptionRadioField,
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
    case "symbolLayer":
      return (
        <SymbolLayerSettings
          activeField={activeField}
          chartConfig={chartConfig}
          metaData={metaData}
        ></SymbolLayerSettings>
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
                message: "Show layer",
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
              id="areaLayer.measureIri"
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
          <SectionTitle iconName={"segments"}>Color scale</SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.palette"
              label="Palette"
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
          <ControlSectionContent side="right">
            <FieldSetLegend legendTitle={"Continuous"}></FieldSetLegend>
            <ChartOptionRadioField
              label="Linear interpolation"
              field={activeField}
              path="paletteType"
              value={"continuous"}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionRadioField>
            <FieldSetLegend legendTitle={"Discrete"}></FieldSetLegend>
            <ChartOptionRadioField
              label="Quantize (equal intervals)"
              field={activeField}
              path="paletteType"
              value={"discrete"}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionRadioField>
            <ChartOptionRadioField
              label="Quantiles (equal distribution of values)"
              field={activeField}
              path="paletteType"
              value={"quantile"}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionRadioField>
            <ChartOptionRadioField
              label="Jenks (natural breaks)"
              field={activeField}
              path="paletteType"
              value={"jenks"}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionRadioField>
            <ChartOptionSelectField
              id="areaLayer.nbClass"
              label="Number of classes"
              field={activeField}
              path="nbClass"
              options={Array.from({ length: 7 }, (_, i) => 3 + i).map((d) => ({
                value: d,
                label: String(d),
              }))}
              disabled={!chartConfig.fields.areaLayer.show}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  }
);

export const SymbolLayerSettings = memo(
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
                id: "fields.symbolLayer.show",
                message: "Show layer",
              })}
              field={"symbolLayer"}
              path="show"
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName={"settings"}>Measure</SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="symbolLayer.iri"
              label="Select a measure"
              field={activeField}
              path="componentIri"
              options={metaData.measures.map((d) => ({
                value: d.iri,
                label: d.label,
              }))}
              disabled={!chartConfig.fields.symbolLayer.show}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  }
);
