import { t, Trans } from "@lingui/macro";
import React, { memo, useMemo } from "react";
import { Box, Flex } from "theme-ui";
import { ConfiguratorStateConfiguringChart, MapConfig } from "..";
import { FieldSetLegend } from "../../components/form";
import {
  GeoFeature,
  getGeoDimensions,
  getGeoShapesDimensions,
} from "../../domain/data";
import { useGeoShapesByDimensionIriQuery } from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { useLocale } from "../../src";
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
import { DimensionValuesMultiFilter } from "../components/filters";

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
        <Trans id="chart.map.layers.base">Base Layer</Trans>
      </SectionTitle>
      <ControlSectionContent side="right">
        <ChartOptionCheckboxField
          label={t({
            id: "chart.map.layers.base.show",
            message: "Show",
          })}
          field={null}
          path="baseLayer.show"
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
    const locale = useLocale();
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

    const [{ data: fetchedGeoShapes }] = useGeoShapesByDimensionIriQuery({
      variables: {
        dataCubeIri: metaData.iri,
        dimensionIri: chartConfig.fields.areaLayer.componentIri,
        locale,
      },
    });

    const geoShapes =
      fetchedGeoShapes?.dataCubeByIri?.dimensionByIri?.__typename ===
      "GeoShapesDimension"
        ? (fetchedGeoShapes.dataCubeByIri.dimensionByIri.geoShapes as any)
        : undefined;

    const hierarchyLevelOptions = useMemo(
      () =>
        [
          ...new Set(
            (
              geoShapes?.topology?.objects?.shapes?.geometries as GeoFeature[]
            )?.map((d) => d.properties.hierarchyLevel)
          ),
        ]?.map((d) => ({ value: d, label: `${d}` })),
      [geoShapes]
    );

    const measuresOptions = useMemo(
      () =>
        metaData.measures.map((d) => ({
          value: d.iri,
          label: d.label,
        })),
      [metaData.measures]
    );

    const numberOfGeoShapes = (geoShapes?.topology?.objects?.shapes?.geometries
      ?.length || 0) as number;

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

    const isAvailable = geoShapesDimensions.length > 0;
    const isHidden = !chartConfig.fields.areaLayer.show;

    return !isAvailable ? (
      <NoGeoDimensionsWarning />
    ) : (
      <>
        <ControlSection>
          <SectionTitle iconName="mapRegions">
            <Trans id="chart.map.layers.area">Areas</Trans>
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionCheckboxField
              label={t({
                id: "chart.map.layers.show",
                message: "Show layer",
              })}
              field="areaLayer"
              path="show"
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartMap">
            {t({
              id: "controls.dimension.geographical",
              message: "Geographical dimension",
            })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.componentIri"
              label={t({
                id: "controls.select.dimension",
                message: "Select a dimension",
              })}
              field={activeField}
              path="componentIri"
              options={geoShapesDimensionsOptions}
              disabled={isHidden}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="list">
            {t({ id: "controls.hierarchy", message: "Hierarchy level" })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField<number>
              id="areaLayer.hierarchyLevel"
              label={t({
                id: "controls.hierarchy.select",
                message: "Select a hierarchy level",
              })}
              field={activeField}
              path="hierarchyLevel"
              options={hierarchyLevelOptions}
              getValue={(d) => +d}
              disabled={isHidden}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartBar">
            {t({ id: "controls.measure", message: "Measure" })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="areaLayer.measureIri"
              label={t({
                id: "controls.select.measure",
                message: "Select a measure",
              })}
              field={activeField}
              path="measureIri"
              options={measuresOptions}
              disabled={isHidden}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="segments">
            {t({ id: "controls.color", message: "Color" })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <FieldSetLegend
              legendTitle={t({
                id: "controls.scale.type",
                message: "Scale type",
              })}
            />
            <Flex sx={{ justifyContent: "flex-start" }} mt={1}>
              <ChartOptionRadioField
                label={t({
                  id: "chart.map.layers.area.discretization.continuous",
                  message: "Continuous",
                })}
                field={activeField}
                path="colorScaleType"
                value="continuous"
                disabled={isHidden}
              />

              {/* Limit the number of clusters to min. 3 */}
              {numberOfGeoShapes >= 3 && (
                <ChartOptionRadioField
                  label={t({
                    id: "chart.map.layers.area.discretization.discrete",
                    message: "Discrete",
                  })}
                  field={activeField}
                  path="colorScaleType"
                  value="discrete"
                  disabled={isHidden}
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
              disabled={isHidden}
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
                    disabled={isHidden}
                  />
                  <ChartOptionSelectField<number>
                    id="areaLayer.nbClass"
                    label="Number of classes"
                    field={activeField}
                    path="nbClass"
                    options={numberOfColorScaleClasses}
                    getValue={(d) => +d}
                    disabled={isHidden}
                  />
                </>
              )}
          </ControlSectionContent>
        </ControlSection>
        {!isHidden && (
          <ControlSection>
            <SectionTitle iconName="segments">Filter</SectionTitle>
            <ControlSectionContent side="right">
              <DimensionValuesMultiFilter
                key={chartConfig.fields.areaLayer.componentIri}
                dimensionIri={chartConfig.fields.areaLayer.componentIri}
                dataSetIri={metaData.iri}
              />
            </ControlSectionContent>
          </ControlSection>
        )}
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

    const isAvailable = geoDimensions.length > 0;
    const isHidden = !chartConfig.fields.symbolLayer.show;

    return !isAvailable ? (
      <NoGeoDimensionsWarning />
    ) : (
      <>
        <ControlSection>
          <SectionTitle iconName="mapSymbols">
            <Trans id="chart.map.layers.symbol">Symbols</Trans>
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionCheckboxField
              label={t({
                id: "chart.map.layers.show",
                message: "Show layer",
              })}
              field="symbolLayer"
              path="show"
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartMap">
            {t({
              id: "controls.dimension.geographical",
              message: "Geographical dimension",
            })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="symbolLayer.componentIri"
              label={t({
                id: "controls.select.dimension",
                message: "Select a dimension",
              })}
              field={activeField}
              path="componentIri"
              options={geoDimensionsOptions}
              disabled={isHidden}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="chartBar">
            {t({ id: "controls.measure", message: "Measure" })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <ChartOptionSelectField
              id="symbolLayer.measureIri"
              label={t({
                id: "controls.select.measure",
                message: "Select a measure",
              })}
              field={activeField}
              path="measureIri"
              options={measuresOptions}
              disabled={isHidden}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="segments">
            {t({ id: "controls.color", message: "Color" })}
          </SectionTitle>
          <ControlSectionContent side="right">
            <ColorPickerField
              label={t({
                id: "controls.color.select",
                message: "Select a color",
              })}
              field={activeField}
              path="color"
              disabled={isHidden}
            />
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="segments">Filter</SectionTitle>
          {!isHidden && (
            <ControlSectionContent side="right">
              <DimensionValuesMultiFilter
                key={chartConfig.fields.symbolLayer.componentIri}
                dimensionIri={chartConfig.fields.symbolLayer.componentIri}
                dataSetIri={metaData.iri}
              />
            </ControlSectionContent>
          )}
        </ControlSection>
      </>
    );
  }
);

const NoGeoDimensionsWarning = () => {
  return (
    <Box sx={{ my: 3, py: 3, px: 5, width: "80%" }}>
      <Trans id="chart.map.warning.noGeoDimensions">
        In this dataset there are no geographical dimensions to display.
      </Trans>
    </Box>
  );
};
