import { t, Trans } from "@lingui/macro";
import React, { memo, useMemo } from "react";
import { ConfiguratorStateConfiguringChart, MapConfig } from "..";
import { FieldSetLegend } from "../../components/form";
import { getGeoDimensions, getGeoShapesDimensions } from "../../domain/data";
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
  ColorPickerField,
} from "../components/field";

const NUMBER_OF_CLASSES_OPTIONS = Array.from(
  { length: 7 },
  (_, i) => i + 3
).map((d) => ({
  value: d,
  label: `${d}`,
}));

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
    const geoShapesDimensions = useMemo(
      () => getGeoShapesDimensions(metaData.dimensions),
      [metaData.dimensions]
    );
    const disabled = useMemo(
      () => !chartConfig.fields.areaLayer.show,
      [chartConfig.fields.areaLayer.show]
    );

    return (
      <>
        <ControlSection>
          <SectionTitle iconName="settings">
            <Trans id="controls.section.areaLayerSettings">
              Area layer settings
            </Trans>
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionCheckboxField
              label={t({
                id: "fields.areaLayer.show",
                message: "Show layer",
              })}
              field="areaLayer"
              path="show"
              disabled={geoShapesDimensions.length === 0}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartMap">
            Geographical dimension
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.componentIri"
              label="Select a dimension"
              field={activeField}
              path="componentIri"
              options={geoShapesDimensions.map((d) => ({
                value: d.iri,
                label: d.label,
              }))}
              disabled={disabled}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartBar">Measure</SectionTitle>
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
              disabled={disabled}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="segments">Color scale</SectionTitle>
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
              disabled={disabled}
            ></ChartOptionSelectField>
          </ControlSectionContent>
          <ControlSectionContent side="right">
            <FieldSetLegend legendTitle="Continuous"></FieldSetLegend>
            <ChartOptionRadioField
              label="Linear interpolation"
              field={activeField}
              path="paletteType"
              value="continuous"
              disabled={disabled}
            ></ChartOptionRadioField>
            <FieldSetLegend legendTitle="Discrete"></FieldSetLegend>
            <ChartOptionRadioField
              label="Quantize (equal intervals)"
              field={activeField}
              path="paletteType"
              value="discrete"
              disabled={disabled}
            ></ChartOptionRadioField>
            <ChartOptionRadioField
              label="Quantiles (equal distribution of values)"
              field={activeField}
              path="paletteType"
              value="quantile"
              disabled={disabled}
            ></ChartOptionRadioField>
            <ChartOptionRadioField
              label="Jenks (natural breaks)"
              field={activeField}
              path="paletteType"
              value="jenks"
              disabled={disabled}
            ></ChartOptionRadioField>
            <ChartOptionSelectField
              id="areaLayer.nbClass"
              label="Number of classes"
              field={activeField}
              path="nbClass"
              options={NUMBER_OF_CLASSES_OPTIONS}
              disabled={disabled}
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
    const geoDimensions = useMemo(
      () => getGeoDimensions(metaData.dimensions),
      [metaData.dimensions]
    );
    const disabled = useMemo(
      () => !chartConfig.fields.symbolLayer.show,
      [chartConfig.fields.symbolLayer.show]
    );

    return (
      <>
        <ControlSection>
          <SectionTitle iconName="settings">
            <Trans id="controls.section.symbolLayerSettings">
              Symbol layer settings
            </Trans>
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionCheckboxField
              label={t({
                id: "fields.symbolLayer.show",
                message: "Show layer",
              })}
              field="symbolLayer"
              path="show"
              disabled={geoDimensions.length === 0}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="mapSymbols">
            Geographical dimension
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="symbolLayer.componentIri"
              label="Select a dimension"
              field={activeField}
              path="componentIri"
              options={geoDimensions.map((d) => ({
                value: d.iri,
                label: d.label,
              }))}
              disabled={disabled}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartBar">Measure</SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="symbolLayer.measureIri"
              label="Select a measure"
              field={activeField}
              path="measureIri"
              options={metaData.measures.map((d) => ({
                value: d.iri,
                label: d.label,
              }))}
              disabled={disabled}
            ></ChartOptionSelectField>
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="segments">Color</SectionTitle>
          <ControlSectionContent side="right">
            <ColorPickerField
              label="Select a color"
              field={activeField}
              path="color"
              disabled={disabled}
            ></ColorPickerField>
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  }
);
