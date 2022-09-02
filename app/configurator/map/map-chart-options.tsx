import { t, Trans } from "@lingui/macro";
import { Box, SelectChangeEvent, Stack } from "@mui/material";
import { get } from "lodash";
import React, { memo, useEffect, useMemo } from "react";

import { getMap } from "@/charts/map/ref";
import Flex from "@/components/flex";
import { FieldSetLegend, Select } from "@/components/form";
import { Option } from "@/configurator";
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
  ChartOptionSliderField,
  ChartOptionSwitchField,
  ColorPickerField,
} from "@/configurator/components/field";
import { DimensionValuesMultiFilter } from "@/configurator/components/filters";
import { DataSource } from "@/configurator/config-types";
import { isConfiguring } from "@/configurator/configurator-state";
import {
  canDimensionBeMultiFiltered,
  GeoFeature,
  getGeoDimensions,
  getGeoShapesDimensions,
} from "@/domain/data";
import { useGeoShapesByDimensionIriQuery } from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { useConfiguratorState, useLocale } from "@/src";
import useEvent from "@/utils/use-event";

import { FIELD_VALUE_NONE } from "../constants";

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

    if (chartConfig.baseLayer.locked) {
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
  }, [chartConfig.baseLayer.locked, dispatch]);

  return (
    <ControlSection>
      <SectionTitle iconName="mapMaptype">
        <Trans id="chart.map.layers.base">Map Display</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
        <ChartOptionCheckboxField
          label={t({
            id: "chart.map.layers.base.show",
            message: "Show",
          })}
          field={null}
          path="baseLayer.show"
        />
        <ChartOptionSwitchField
          label={t({
            id: "chart.map.layers.base.view.locked",
            message: "Locked view",
          })}
          field={null}
          path="baseLayer.locked"
        />
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
          <ControlSectionContent>
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
          <ControlSectionContent>
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
          <SectionTitle iconName="chartBar">
            {t({ id: "controls.measure", message: "Measure" })}
          </SectionTitle>
          <ControlSectionContent>
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
          <ControlSectionContent>
            <div>
              <FieldSetLegend
                legendTitle={t({
                  id: "controls.scale.type",
                  message: "Scale type",
                })}
              />
              <Flex sx={{ justifyContent: "flex-start" }}>
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
            </div>

            <ColorRampField
              field={activeField}
              path="palette"
              nbClass={colorScaleType === "discrete" ? nbClass : undefined}
              disabled={isHidden}
            />

            {colorScaleType === "discrete" && nbOfGeoShapes >= 3 && (
              <>
                <FieldSetLegend legendTitle="Interpolation" />
                <Stack spacing={2}>
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
                </Stack>
              </>
            )}
          </ControlSectionContent>
        </ControlSection>
        {!isHidden && (
          <ControlSection>
            <SectionTitle iconName="filter">Filter</SectionTitle>
            <ControlSectionContent>
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
    chartConfig: {
      fields: { symbolLayer },
    },
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

    const colorDimensionsOptions = useMemo(() => {
      return [
        ...metaData.dimensions
          .filter(canDimensionBeMultiFiltered)
          .map((d) => ({ label: d.label, value: d.iri })),
        ...measuresOptions,
      ];
    }, [metaData.dimensions, measuresOptions]);

    const isAvailable = geoDimensions.length > 0;
    const isHidden = !symbolLayer.show;

    return !isAvailable ? (
      <NoGeoDimensionsWarning />
    ) : (
      <>
        <ControlSection>
          <SectionTitle iconName="mapSymbols">
            <Trans id="chart.map.layers.symbol">Symbols</Trans>
          </SectionTitle>
          <ControlSectionContent>
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
          <ControlSectionContent>
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
          <ControlSectionContent>
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
          <ControlSectionContent>
            <SymbolColorSelect
              metaData={metaData}
              options={colorDimensionsOptions}
              disabled={isHidden}
            />
            {symbolLayer.colors.type === "fixed" ? (
              <>
                <ColorPickerField
                  label={t({
                    id: "controls.color.select",
                    message: "Select a color",
                  })}
                  field={activeField}
                  path="colors.value"
                  disabled={isHidden}
                />
                <ChartOptionSliderField
                  field={activeField}
                  path="colors.opacity"
                  label={t({
                    id: "controls.color.opacity",
                    message: "Opacity",
                  })}
                  min={0}
                  max={100}
                  step={10}
                  disabled={isHidden}
                  defaultValue={70}
                />
              </>
            ) : symbolLayer.colors.type === "categorical" ? (
              symbolLayer.componentIri !== symbolLayer.colors.componentIri ? (
                <DimensionValuesMultiFilter
                  key={symbolLayer.componentIri}
                  dataSetIri={metaData.iri}
                  dimensionIri={symbolLayer.colors.componentIri}
                  field={activeField}
                  colorConfigPath="colors"
                />
              ) : null
            ) : (
              <ColorRampField field={activeField} path="colors.palette" />
            )}
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle iconName="filter">Filter</SectionTitle>
          {!isHidden && (
            <ControlSectionContent>
              <DimensionValuesMultiFilter
                key={symbolLayer.componentIri}
                dataSetIri={metaData.iri}
                dimensionIri={symbolLayer.componentIri}
                field={activeField}
                colorConfigPath="colors"
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

const SymbolColorSelect = ({
  metaData,
  options,
  disabled,
}: {
  metaData: DataCubeMetadata;
  options: Option[];
  disabled?: boolean;
}) => {
  const [state, dispatch] = useConfiguratorState();

  const noneLabel = t({
    id: "controls.dimension.none",
    message: `No dimension selected`,
  });
  const optionsWithNoneValue = useMemo(() => {
    return [
      {
        label: noneLabel,
        value: FIELD_VALUE_NONE,
        isNoneValue: true,
      },
      ...options,
    ];
  }, [options, noneLabel]);

  const handleChange = useEvent((e: SelectChangeEvent<unknown>) => {
    dispatch({
      type: "CHART_FIELD_CHANGED",
      value: {
        field: "colors",
        componentIri: e.target.value as string,
        dataSetMetadata: metaData,
      },
    });
  });

  const value = get(
    state,
    `chartConfig.fields.symbolLayer.colors.componentIri`,
    FIELD_VALUE_NONE
  );

  return (
    <Select
      id="symbol-color-select"
      label={t({
        id: "controls.select.dimension",
        message: "Select a dimension",
      })}
      options={optionsWithNoneValue}
      onChange={handleChange}
      value={value}
      disabled={disabled}
    />
  );
};
