import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import React, { memo, useEffect, useMemo } from "react";

import { getMap } from "@/charts/map/ref";
import Flex from "@/components/flex";
import { FieldSetLegend } from "@/components/form";
import { ConfiguratorStateConfiguringChart, MapConfig } from "@/configurator";
import { ColorRampField } from "@/configurator/components/chart-controls/color-ramp";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartOptionCheckboxField,
  ChartOptionRadioField,
  ChartOptionSelectField,
  ColorPickerField,
} from "@/configurator/components/field";
import { DimensionValuesMultiFilter } from "@/configurator/components/filters";
import { DataSource } from "@/configurator/config-types";
import { isConfiguring } from "@/configurator/configurator-state";
import {
  GeoFeature,
  getGeoDimensions,
  getGeoShapesDimensions,
} from "@/domain/data";
import { useGeoShapesByDimensionIriQuery } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { useConfiguratorState, useLocale } from "@/src";

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
      return <BaseLayerSettings />;
    case "areaLayer":
      return (
        <AreaLayerSettings
          chartConfig={chartConfig}
          metaData={metaData}
          dataSource={state.dataSource}
        />
      );
    case "symbolLayer":
      return (
        <SymbolLayerSettings chartConfig={chartConfig} metaData={metaData} />
      );
    default:
      return null;
  }
};

const BaseLayerSettings = memo(() => {
  const [state, dispatch] = useConfiguratorState(isConfiguring);
  const chartConfig = state.chartConfig as MapConfig;

  useEffect(() => {
    const map = getMap();

    if (chartConfig.baseLayer.controlsType === "locked") {
      if (map !== null) {
        dispatch({
          type: "CHART_OPTION_CHANGED",
          value: {
            field: null,
            path: "baseLayer.bbox",
            value: map.getBounds().toArray(),
          },
        });
      }
    } else {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          field: null,
          path: "baseLayer.bbox",
          value: undefined,
        },
      });
    }
  }, [chartConfig.baseLayer.controlsType, dispatch]);

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
        <Box component="fieldset" mt={4}>
          <FieldSetLegend legendTitle="Map controls type" />
          <Flex sx={{ justifyContent: "flex-start" }}>
            <ChartOptionRadioField
              label="Dynamic"
              field={null}
              path="baseLayer.controlsType"
              value="dynamic"
            />
            <ChartOptionRadioField
              label="Locked"
              field={null}
              path="baseLayer.controlsType"
              value="locked"
            />
          </Flex>
        </Box>
      </ControlSectionContent>
    </ControlSection>
  );
});

export const AreaLayerSettings = memo(
  ({
    dataSource,
    chartConfig,
    metaData,
  }: {
    dataSource: DataSource;
    chartConfig: MapConfig;
    metaData: DataCubeMetadata;
  }) => {
    const locale = useLocale();
    const activeField = "areaLayer";
    const geoShapesDimensions = useMemo(() => {
      return getGeoShapesDimensions(metaData.dimensions);
    }, [metaData.dimensions]);
    const geoShapesDimensionsOptions = useMemo(() => {
      return geoShapesDimensions.map((d) => ({
        value: d.iri,
        label: d.label,
      }));
    }, [geoShapesDimensions]);

    const [{ data: fetchedGeoShapes }] = useGeoShapesByDimensionIriQuery({
      variables: {
        dataCubeIri: metaData.iri,
        dimensionIri: chartConfig.fields.areaLayer.componentIri,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        locale,
      },
    });

    const geoShapes =
      fetchedGeoShapes?.dataCubeByIri?.dimensionByIri?.__typename ===
      "GeoShapesDimension"
        ? fetchedGeoShapes.dataCubeByIri.dimensionByIri.geoShapes
        : undefined;
    const geometries = geoShapes?.topology?.objects?.shapes?.geometries as
      | GeoFeature[]
      | undefined;

    const hierarchyLevelOptions = useMemo(() => {
      return [
        ...new Set(geometries?.map((d) => d.properties.hierarchyLevel)),
      ]?.map((d) => ({ value: d, label: `${d}` }));
    }, [geometries]);

    const measuresOptions = useMemo(() => {
      return metaData.measures.map((d) => ({
        value: d.iri,
        label: d.label,
      }));
    }, [metaData.measures]);

    const nbOfGeoShapes = geometries?.length || 0;
    const colorClassesOptions = useMemo(() => {
      return Array.from(
        { length: Math.min(7, Math.max(0, nbOfGeoShapes - 2)) },
        (_, i) => i + 3
      ).map((d) => ({ value: d, label: `${d}` }));
    }, [nbOfGeoShapes]);

    const { colorScaleType, nbClass, show } = chartConfig.fields.areaLayer;
    const isAvailable = geoShapesDimensions.length > 0;
    const isHidden = !show;

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
          <SectionTitle iconName="color">
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
              {nbOfGeoShapes >= 3 && (
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
              nbClass={colorScaleType === "discrete" ? nbClass : undefined}
              disabled={isHidden}
            />

            {colorScaleType === "discrete" && nbOfGeoShapes >= 3 && (
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
                  options={colorClassesOptions}
                  getValue={(d) => +d}
                  disabled={isHidden}
                />
              </>
            )}
          </ControlSectionContent>
        </ControlSection>
        {!isHidden && (
          <ControlSection>
            <SectionTitle iconName="filter">Filter</SectionTitle>
            <ControlSectionContent side="right">
              <DimensionValuesMultiFilter
                key={chartConfig.fields.areaLayer.componentIri}
                dataSetIri={metaData.iri}
                dimensionIri={chartConfig.fields.areaLayer.componentIri}
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
    const geoDimensionsOptions = useMemo(() => {
      return geoDimensions.map((d) => ({
        value: d.iri,
        label: d.label,
      }));
    }, [geoDimensions]);

    const measuresOptions = useMemo(() => {
      return metaData.measures.map((d) => ({
        value: d.iri,
        label: d.label,
      }));
    }, [metaData.measures]);

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
          <SectionTitle iconName="color">
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
          <SectionTitle iconName="filter">Filter</SectionTitle>
          {!isHidden && (
            <ControlSectionContent side="right">
              <DimensionValuesMultiFilter
                key={chartConfig.fields.symbolLayer.componentIri}
                dataSetIri={metaData.iri}
                dimensionIri={chartConfig.fields.symbolLayer.componentIri}
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
