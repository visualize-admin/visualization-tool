import { t, Trans } from "@lingui/macro";
import { Box, Stack, Typography } from "@mui/material";
import get from "lodash/get";
import { useCallback, useMemo } from "react";

import { EncodingSpec } from "@/charts/chart-config-ui-options";
import {
  DEFAULT_FIXED_COLOR_FIELD_OPACITY,
  DEFAULT_OTHER_COLOR_FIELD_OPACITY,
} from "@/charts/map/constants";
import { RadioGroup } from "@/components/form";
import {
  ChartConfig,
  ColorFieldType,
  ColorScaleType,
  ComponentType,
} from "@/config-types";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import { ColorRampField } from "@/configurator/components/chart-controls/color-ramp";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { Abbreviations } from "@/configurator/components/chart-options-selector/abbreviations";
import { makeGetFieldOptionGroups } from "@/configurator/components/chart-options-selector/utils";
import {
  ChartOptionRadioField,
  ChartOptionSelectField,
  ChartOptionSliderField,
  ColorPickerField,
} from "@/configurator/components/field";
import { DimensionValuesMultiFilter } from "@/configurator/components/filters";
import {
  Component,
  Dimension,
  getComponentsFilteredByType,
  isMeasure,
  Measure,
} from "@/domain/data";

export const ColorComponentField = ({
  chartConfig,
  encoding,
  component,
  componentTypes,
  dimensions,
  measures,
  getFieldOptionGroups,
  optional,
  enableUseAbbreviations,
}: {
  chartConfig: ChartConfig;
  encoding: EncodingSpec;
  component: Component;
  componentTypes: ComponentType[];
  dimensions: Dimension[];
  measures: Measure[];
  getFieldOptionGroups: ReturnType<typeof makeGetFieldOptionGroups>;
  optional: boolean;
  enableUseAbbreviations: boolean;
}) => {
  const field = encoding.field;
  const nbOptions = component.values.length;

  const fieldComponents = useMemo(() => {
    return getComponentsFilteredByType({
      dimensionTypes: componentTypes,
      dimensions,
      measures,
    });
  }, [componentTypes, dimensions, measures]);
  const getOption = useCallback(
    (c: Component) => ({ value: c.id, label: c.label }),
    []
  );
  const options = useMemo(() => {
    return chartConfig.cubes.length === 1 ? fieldComponents.map(getOption) : [];
  }, [chartConfig.cubes.length, fieldComponents, getOption]);
  const optionGroups = useMemo(() => {
    return chartConfig.cubes.length > 1
      ? getFieldOptionGroups({ fieldComponents, getOption })
      : undefined;
  }, [
    chartConfig.cubes.length,
    fieldComponents,
    getFieldOptionGroups,
    getOption,
  ]);

  const nbColorOptions = useMemo(() => {
    return Array.from(
      { length: Math.min(7, Math.max(0, nbOptions - 2)) },
      (_, i) => i + 3
    ).map((d) => ({ value: d, label: `${d}` }));
  }, [nbOptions]);

  const colorComponentId = get(chartConfig, [
    "fields",
    encoding.field,
    "color",
    "componentId",
  ]) as string | undefined;
  const colorComponent = [...dimensions, ...measures].find(
    (d) => d.id === colorComponentId
  );
  const colorType = get(chartConfig, [
    "fields",
    field,
    "color",
    "type",
  ]) as ColorFieldType;
  const colorScaleType = get(chartConfig, [
    "fields",
    field,
    "color",
    "scaleType",
  ]) as ColorScaleType | undefined;
  const nbClass = get(chartConfig, ["fields", field, "color", "nbClass"]) as
    | number
    | undefined;

  return (
    <ControlSection collapse>
      <SectionTitle iconName="swatch">
        <Trans id="controls.color">Color</Trans>
      </SectionTitle>
      <ControlSectionContent>
        <ChartOptionSelectField
          id="color-component"
          label={t({
            id: "controls.select.measure",
            message: "Select a measure",
          })}
          field={field}
          path="color.componentId"
          options={options}
          optionGroups={optionGroups}
          optional={optional}
        />
        {enableUseAbbreviations && (
          <Box sx={{ mt: 1 }}>
            <Abbreviations
              field={field}
              path="color"
              component={colorComponent}
            />
          </Box>
        )}
        {field === "symbolLayer" && (
          <Box sx={{ mt: 1 }}>
            <ChartOptionSliderField
              field={field}
              path="color.opacity"
              label={t({
                id: "controls.color.opacity",
                message: "Opacity",
              })}
              min={0}
              max={100}
              step={10}
              defaultValue={
                colorType === "fixed"
                  ? DEFAULT_FIXED_COLOR_FIELD_OPACITY
                  : DEFAULT_OTHER_COLOR_FIELD_OPACITY
              }
            />
          </Box>
        )}
        {colorType === "fixed" ? (
          <>
            <ColorPickerField
              label={t({
                id: "controls.color.select",
                message: "Select a color",
              })}
              field={field}
              path="color.value"
            />
          </>
        ) : colorType === "categorical" ? (
          colorComponentId &&
          component.id !== colorComponentId &&
          colorComponent &&
          !isMeasure(colorComponent) ? (
            <DimensionValuesMultiFilter
              dimension={colorComponent}
              field={field}
              colorConfigPath="color"
              colorComponent={colorComponent}
            />
          ) : (
            <ColorPalette
              field="symbolLayer"
              colorConfigPath="color"
              component={colorComponent}
            />
          )
        ) : colorType === "numerical" ? (
          <div>
            <ColorRampField field={field} path="color" nSteps={nbClass} />
            <Typography variant="caption" component="p" sx={{ mb: 1 }}>
              <Trans id="controls.scale.type">Scale type</Trans>
            </Typography>
            <RadioGroup>
              <ChartOptionRadioField
                label={t({
                  id: "controls.color.scale.type.continuous",
                  message: "Continuous",
                })}
                field={field}
                path="color.scaleType"
                value="continuous"
              />
              {nbOptions >= 3 && (
                <ChartOptionRadioField
                  label={t({
                    id: "controls.color.scale.type.discrete",
                    message: "Discrete",
                  })}
                  field={field}
                  path="color.scaleType"
                  value="discrete"
                />
              )}
            </RadioGroup>
          </div>
        ) : null}
        {colorScaleType === "discrete" && nbOptions >= 3 ? (
          <Stack spacing={2}>
            <ChartOptionSelectField
              id="color-scale-interpolation"
              label={t({
                id: "controls.color.scale.interpolation",
                message: "Interpolation",
              })}
              field={field}
              path="color.interpolationType"
              options={[
                {
                  label: t({
                    id: "controls.color.scale.discretization.quantize",
                    message: "Quantize (equal intervals)",
                  }),
                  value: "quantize",
                },
                {
                  label: t({
                    id: "controls.color.scale.discretization.quantiles",
                    message: "Quantiles (equal distribution of values)",
                  }),
                  value: "quantile",
                },
                {
                  label: t({
                    id: "controls.color.scale.discretization.jenks",
                    message: "Jenks (natural breaks)",
                  }),
                  value: "jenks",
                },
              ]}
            />
            <ChartOptionSelectField<number>
              id="number-of-colors"
              label={t({
                id: "controls.color.scale.number.of.classes",
                message: "Number of classes",
              })}
              field={field}
              path="color.nbClass"
              options={nbColorOptions}
              getValue={(d) => +d}
            />
          </Stack>
        ) : null}
      </ControlSectionContent>
    </ControlSection>
  );
};
