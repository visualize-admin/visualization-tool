import { t, Trans } from "@lingui/macro";
import React, { memo, useMemo } from "react";
import { Flex } from "theme-ui";
import { ConfiguratorStateConfiguringChart, MapConfig } from "..";
import { FieldSetLegend } from "../../components/form";
import {
  GeoFeature,
  getGeoDimensions,
  getGeoShapesDimensions,
} from "../../domain/data";
import { GeoShapesDimension } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { ColorRampField } from "../components/chart-controls/color-ramp";
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
    case "baseLayer":
      return <BaseLayersSettings />;
    case "areaLayer":
      return (
        <AreaLayerSettings chartConfig={chartConfig} metaData={metaData} />
      );
    case "symbolLayer":
      return (
        <SymbolLayerSettings
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
      <SectionTitle iconName="mapMaptype">
        <Trans id="controls.section.baseLayer">Settings</Trans>
      </SectionTitle>
      <ControlSectionContent side="right">
        <ChartOptionCheckboxField
          label={t({
            id: "controls.baseLayer.showRelief",
            message: "Show relief",
          })}
          field={null}
          path="baseLayer.showRelief"
        />
        <ChartOptionCheckboxField
          label={t({
            id: "controls.baseLayer.showLakes",
            message: "Show lakes",
          })}
          field={null}
          path="baseLayer.showLakes"
        />
      </ControlSectionContent>
    </ControlSection>
  );
});

export const AreaLayerSettings = memo(
  ({
    chartConfig,
    metaData,
  }: {
    chartConfig: MapConfig;
    metaData: DataCubeMetadata;
  }) => {
    const activeField = "areaLayer";
    const geoShapesDimensions = useMemo(
      () => getGeoShapesDimensions(metaData.dimensions),
      [metaData.dimensions]
    );
    const geoShapesDimensionsOptions = useMemo(
      () =>
        geoShapesDimensions.map((d) => ({
          value: d.iri,
          label: d.label,
        })),
      [geoShapesDimensions]
    );
    const dimension = geoShapesDimensions.find(
      (d) => d.iri === chartConfig.fields.areaLayer.componentIri
    ) as GeoShapesDimension;

    const hierarchyLevelOptions = useMemo(
      () =>
        [
          ...new Set(
            (
              (dimension?.geoShapes as any)?.topology?.objects?.shapes
                ?.geometries as GeoFeature[]
            )?.map((d) => d.properties.hierarchyLevel)
          ),
        ]?.map((d) => ({ value: d, label: `${d}` })),
      [dimension?.geoShapes]
    );

    const measuresOptions = useMemo(
      () =>
        metaData.measures.map((d) => ({
          value: d.iri,
          label: d.label,
        })),
      [metaData.measures]
    );

    const numberOfGeoShapes = (
      dimension
        ? dimension.geoShapes.topology.objects.shapes.geometries.length
        : 0
    ) as number;

    const numberOfColorScaleClasses = useMemo(
      () =>
        Array.from(
          { length: Math.min(7, Math.max(0, numberOfGeoShapes - 2)) },
          (_, i) => i + 3
        ).map((d) => ({ value: d, label: `${d}` })),
      [numberOfGeoShapes]
    );

    const currentNumberOfColorScaleClasses =
      chartConfig.fields.areaLayer.nbClass;
    const currentColorScaleType = chartConfig.fields.areaLayer.colorScaleType;

    const disabled = !chartConfig.fields.areaLayer.show;

    return (
      <>
        <ControlSection>
          <SectionTitle iconName="settings">
            <Trans id="controls.section.areaLayer">Settings</Trans>
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
          <SectionTitle iconName="mapRegions">
            Geographical dimension
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.componentIri"
              label="Select a dimension"
              field={activeField}
              path="componentIri"
              options={geoShapesDimensionsOptions}
              disabled={disabled}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="list">Hierarchy level</SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField<number>
              id="areaLayer.hierarchyLevel"
              label="Select a hierarchy level (1 - lowest)"
              field={activeField}
              path="hierarchyLevel"
              options={hierarchyLevelOptions}
              getValue={(d) => +d}
              disabled={disabled}
            />
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
              options={measuresOptions}
              disabled={disabled}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="segments">Color scale</SectionTitle>
          <ControlSectionContent side="right">
            <FieldSetLegend legendTitle="Scale type" />
            <Flex sx={{ justifyContent: "flex-start" }} mt={1}>
              <ChartOptionRadioField
                label="Continuous"
                field={activeField}
                path="colorScaleType"
                value="continuous"
                disabled={disabled}
              />

              {/* Limit the number of clusters to min. 3 */}
              {numberOfGeoShapes >= 3 && (
                <ChartOptionRadioField
                  label="Discrete"
                  field={activeField}
                  path="colorScaleType"
                  value="discrete"
                  disabled={disabled}
                />
              )}
            </Flex>

            <ColorRampField
              field={activeField}
              path="palette"
              nbClass={
                currentColorScaleType === "discrete"
                  ? currentNumberOfColorScaleClasses
                  : undefined
              }
              disabled={disabled}
            />

            {chartConfig.fields.areaLayer.colorScaleType === "discrete" &&
              numberOfGeoShapes >= 3 && (
                <>
                  <FieldSetLegend legendTitle="Interpolation" />
                  <ChartOptionSelectField
                    id="areaLayer.colorScaleInterpolationType"
                    label={null}
                    field={activeField}
                    path="colorScaleInterpolationType"
                    options={[
                      {
                        label: t({
                          id: "chart.map.layers.area.discretization.quantize",
                          message: "Quantize (equal intervals)",
                        }),
                        value: "quantize",
                      },
                      {
                        label: t({
                          id: "chart.map.layers.area.discretization.quantiles",
                          message: "Quantiles (equal distribution of values)",
                        }),
                        value: "quantile",
                      },
                      {
                        label: t({
                          id: "chart.map.layers.area.discretization.jenks",
                          message: "Jenks (natural breaks)",
                        }),
                        value: "jenks",
                      },
                    ]}
                    disabled={disabled}
                  />
                  <ChartOptionSelectField<number>
                    id="areaLayer.nbClass"
                    label="Number of classes"
                    field={activeField}
                    path="nbClass"
                    options={numberOfColorScaleClasses}
                    disabled={disabled}
                    getValue={(d) => +d}
                  />
                </>
              )}
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  }
);

export const SymbolLayerSettings = memo(
  ({
    chartConfig,
    metaData,
  }: {
    chartConfig: MapConfig;
    metaData: DataCubeMetadata;
  }) => {
    const activeField = "symbolLayer";
    const geoDimensions = useMemo(
      () => getGeoDimensions(metaData.dimensions),
      [metaData.dimensions]
    );
    const geoDimensionsOptions = useMemo(
      () =>
        geoDimensions.map((d) => ({
          value: d.iri,
          label: d.label,
        })),
      [geoDimensions]
    );

    const measuresOptions = useMemo(
      () =>
        metaData.measures.map((d) => ({
          value: d.iri,
          label: d.label,
        })),
      [metaData.measures]
    );

    const disabled = !chartConfig.fields.symbolLayer.show;

    return (
      <>
        <ControlSection>
          <SectionTitle iconName="settings">
            <Trans id="controls.section.symbolLayer">Settings</Trans>
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
              options={geoDimensionsOptions}
              disabled={disabled}
            />
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
              options={measuresOptions}
              disabled={disabled}
            />
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
            />
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  }
);
