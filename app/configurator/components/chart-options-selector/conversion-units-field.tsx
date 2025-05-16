import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { ChangeEvent, ReactNode } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import Flex from "@/components/flex";
import { Checkbox, Input } from "@/components/form";
import { ChartConfig, ConversionUnit } from "@/config-types";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { Component } from "@/domain/data";
import { ComponentId } from "@/graphql/make-component-id";
import { Locale } from "@/locales/locales";
import { useLocale, useOrderedLocales } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

export const ConversionUnitsField = ({
  chartConfig,
  field,
  components,
}: {
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  components: Component[];
}) => {
  switch (chartConfig.chartType) {
    case "area":
    case "column":
    case "line":
    case "pie":
    case "scatterplot": {
      const component = components.find(
        (c) => c.id === (chartConfig.fields as any)[field].componentId
      );

      if (!component) {
        return null;
      }

      const conversionUnit =
        chartConfig.conversionUnitsByComponentId[component.id];
      const originalUnit = component.originalUnit;
      const checked = !!conversionUnit;

      return (
        <ConversionUnitSection
          checked={checked}
          conversionUnits={[{ componentId: component.id, originalUnit }]}
        >
          {checked ? (
            <ConversionUnitContent
              componentId={component.id}
              originalUnit={originalUnit}
              conversionUnit={conversionUnit}
            />
          ) : null}
        </ConversionUnitSection>
      );
    }
    case "bar": {
      const component = components.find(
        (c) => c.id === (chartConfig.fields as any)[field].componentId
      );

      if (!component) {
        return null;
      }

      const conversionUnit =
        chartConfig.conversionUnitsByComponentId[component.id];
      const originalUnit = component.originalUnit;
      const checked = !!conversionUnit;

      return (
        <ConversionUnitSection
          checked={checked}
          conversionUnits={[{ componentId: component.id, originalUnit }]}
        >
          {checked ? (
            <ConversionUnitContent
              componentId={component.id}
              originalUnit={originalUnit}
              conversionUnit={conversionUnit}
            />
          ) : null}
        </ConversionUnitSection>
      );
    }
    case "map": {
      const activeField = field as keyof typeof chartConfig.fields;

      switch (activeField) {
        case "areaLayer": {
          const areaLayer = chartConfig.fields.areaLayer;
          const color = areaLayer?.color;
          const numericalColor =
            color?.type === "numerical" ? color : undefined;
          const colorComponent = components.find(
            (c) => c.id === numericalColor?.componentId
          );

          if (!colorComponent) {
            return null;
          }

          const conversionUnit =
            chartConfig.conversionUnitsByComponentId[colorComponent.id];
          const originalUnit = colorComponent.unit;
          const checked = !!conversionUnit;

          return (
            <ConversionUnitSection
              checked={checked}
              conversionUnits={[
                { componentId: colorComponent.id, originalUnit },
              ]}
            >
              {checked ? (
                <ConversionUnitContent
                  componentId={colorComponent.id}
                  originalUnit={originalUnit}
                  conversionUnit={conversionUnit}
                />
              ) : null}
            </ConversionUnitSection>
          );
        }
        case "symbolLayer": {
          const symbolLayer = chartConfig.fields.symbolLayer;
          const sizeComponent = components.find(
            (c) => c.id === symbolLayer?.measureId
          );
          const color = symbolLayer?.color;
          const numericalColor =
            color?.type === "numerical" ? color : undefined;
          const colorComponent = components.find(
            (c) => c.id === numericalColor?.componentId
          );

          if (!sizeComponent && !colorComponent) {
            return null;
          }

          const sizeConversionUnit =
            chartConfig.conversionUnitsByComponentId[sizeComponent?.id ?? ""];
          const originalSizeUnit = sizeComponent?.unit;
          const colorConversionUnit =
            chartConfig.conversionUnitsByComponentId[colorComponent?.id ?? ""];
          const originalColorUnit = colorComponent?.unit;
          const checked = !!sizeConversionUnit || !!colorConversionUnit;

          return (
            <ConversionUnitSection
              checked={checked}
              conversionUnits={[
                {
                  componentId: sizeComponent?.id,
                  originalUnit: originalSizeUnit,
                },
                {
                  componentId: colorComponent?.id,
                  originalUnit: originalColorUnit,
                },
              ]}
            >
              {checked && sizeComponent ? (
                <div>
                  <Typography variant="body3" fontWeight="bold">
                    <Trans id="controls.size">Size</Trans>:{" "}
                    {sizeComponent.label}
                  </Typography>
                  <ConversionUnitContent
                    componentId={sizeComponent.id}
                    originalUnit={originalSizeUnit}
                    conversionUnit={sizeConversionUnit}
                  />
                </div>
              ) : null}
              {checked && colorComponent ? (
                <div>
                  <Typography variant="body3" fontWeight="bold">
                    <Trans id="controls.color">Color</Trans>:{" "}
                    {colorComponent.label}
                  </Typography>
                  <ConversionUnitContent
                    componentId={colorComponent.id}
                    originalUnit={originalColorUnit}
                    conversionUnit={colorConversionUnit}
                  />
                </div>
              ) : null}
            </ConversionUnitSection>
          );
        }
        case "animation":
          return null;
        default:
          const _exhaustiveCheck: never = activeField;
          return _exhaustiveCheck;
      }
    }
    case "table":
      return null;
    case "comboLineSingle": {
      const component = components.find(
        (c) => c.id === chartConfig.fields.y.componentIds[0]
      );

      if (!component) {
        return null;
      }

      const conversionUnit =
        chartConfig.conversionUnitsByComponentId[component.id];
      const originalUnit = component.unit;
      const checked = !!conversionUnit;

      return (
        <ConversionUnitSection
          checked={checked}
          conversionUnits={[{ componentId: component.id, originalUnit }]}
        >
          {checked ? (
            <ConversionUnitContent
              componentId={component.id}
              originalUnit={originalUnit}
              conversionUnit={conversionUnit}
            />
          ) : null}
        </ConversionUnitSection>
      );
    }
    case "comboLineColumn": {
      const lineComponent = components.find(
        (c) => c.id === chartConfig.fields.y.lineComponentId
      );

      if (!lineComponent) {
        return null;
      }

      const columnComponent = components.find(
        (c) => c.id === chartConfig.fields.y.columnComponentId
      );

      if (!columnComponent) {
        return null;
      }

      const lineConversionUnit =
        chartConfig.conversionUnitsByComponentId[lineComponent.id];
      const originalLineUnit = lineComponent.unit;
      const columnConversionUnit =
        chartConfig.conversionUnitsByComponentId[columnComponent.id];
      const originalColumnUnit = columnComponent.unit;
      const checked = !!lineConversionUnit || !!columnConversionUnit;

      return (
        <ConversionUnitSection
          checked={checked}
          conversionUnits={[
            { componentId: lineComponent.id, originalUnit: originalLineUnit },
            {
              componentId: columnComponent.id,
              originalUnit: originalColumnUnit,
            },
          ]}
        >
          {checked && columnComponent ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {columnComponent.label}
              </Typography>
              <ConversionUnitContent
                componentId={columnComponent.id}
                originalUnit={originalColumnUnit}
                conversionUnit={columnConversionUnit}
              />
            </div>
          ) : null}
          {checked && lineComponent ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {lineComponent.label}
              </Typography>
              <ConversionUnitContent
                componentId={lineComponent.id}
                originalUnit={originalLineUnit}
                conversionUnit={lineConversionUnit}
              />
            </div>
          ) : null}
        </ConversionUnitSection>
      );
    }
    case "comboLineDual": {
      const leftComponent = components.find(
        (c) => c.id === chartConfig.fields.y.leftAxisComponentId
      );

      if (!leftComponent) {
        return null;
      }

      const rightComponent = components.find(
        (c) => c.id === chartConfig.fields.y.rightAxisComponentId
      );

      if (!rightComponent) {
        return null;
      }

      const leftConversionUnit =
        chartConfig.conversionUnitsByComponentId[leftComponent.id];
      const originalLeftUnit = leftComponent.unit;
      const rightConversionUnit =
        chartConfig.conversionUnitsByComponentId[rightComponent.id];
      const originalRightUnit = rightComponent.unit;
      const checked = !!leftConversionUnit || !!rightConversionUnit;

      return (
        <ConversionUnitSection
          checked={checked}
          conversionUnits={[
            { componentId: leftComponent.id, originalUnit: originalLeftUnit },
            { componentId: rightComponent.id, originalUnit: originalRightUnit },
          ]}
        >
          {checked && leftComponent ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {leftComponent.label}
              </Typography>
              <ConversionUnitContent
                componentId={leftComponent.id}
                originalUnit={originalLeftUnit}
                conversionUnit={leftConversionUnit}
              />
            </div>
          ) : null}
          {checked && rightComponent ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {rightComponent.label}
              </Typography>
              <ConversionUnitContent
                componentId={rightComponent.id}
                originalUnit={originalRightUnit}
                conversionUnit={rightConversionUnit}
              />
            </div>
          ) : null}
        </ConversionUnitSection>
      );
    }
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

const ConversionUnitSection = ({
  children,
  checked,
  conversionUnits,
}: {
  children: ReactNode;
  checked: boolean;
  conversionUnits: {
    componentId: ComponentId | undefined;
    originalUnit: string | undefined;
  }[];
}) => {
  const locale = useLocale();
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const handleToggle = useEvent(() => {
    if (!checked) {
      conversionUnits.forEach(({ componentId, originalUnit }) => {
        if (componentId) {
          dispatch({
            type: "CHART_FIELD_UPDATED",
            value: {
              locale,
              field: null,
              path: `conversionUnitsByComponentId["${componentId}"]`,
              value: getDefaultConversionUnit({
                originalUnit,
              }),
            },
          });
        }
      });
    } else {
      conversionUnits.forEach(({ componentId }) => {
        dispatch({
          type: "CHART_FIELD_UPDATED",
          value: {
            locale,
            field: null,
            path: `conversionUnitsByComponentId["${componentId}"]`,
            value: FIELD_VALUE_NONE,
          },
        });
      });
    }
  });

  return (
    <ControlSection collapse defaultExpanded={checked}>
      <SectionTitle iconName="balance">
        <Trans id="controls.convert-unit">Unit Conversion</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
        <Checkbox
          label={t({
            id: "controls.convert-unit.enable",
            message: "Enable unit conversion",
          })}
          checked={checked}
          onChange={handleToggle}
        />
        {children}
      </ControlSectionContent>
    </ControlSection>
  );
};

const ConversionUnitContent = ({
  componentId,
  originalUnit,
  conversionUnit,
}: {
  componentId: ComponentId;
  originalUnit: string | undefined;
  conversionUnit: ConversionUnit;
}) => {
  const locale = useLocale();
  const orderedLocales = useOrderedLocales();
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const definedConversionUnit =
    conversionUnit ?? getDefaultConversionUnit({ originalUnit });
  const handleMultiplierChange = useEvent(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newMultiplier = +e.target.value;

      if (!isNaN(newMultiplier) && newMultiplier > 0) {
        dispatch({
          type: "CHART_FIELD_UPDATED",
          value: {
            locale,
            field: null,
            path: `conversionUnitsByComponentId["${componentId}"]`,
            value: {
              multiplier: newMultiplier,
              labels: definedConversionUnit.labels,
            },
          },
        });
      }
    }
  );

  const handleLabelChange = useEvent((locale: Locale, value: string) => {
    dispatch({
      type: "CHART_FIELD_UPDATED",
      value: {
        locale,
        field: null,
        path: `conversionUnitsByComponentId["${componentId}"]`,
        value: {
          multiplier: definedConversionUnit.multiplier,
          labels: {
            ...definedConversionUnit.labels,
            [locale]: value,
          },
        },
      },
    });
  });

  return (
    <Box sx={{ mt: 2 }}>
      <Flex sx={{ flexDirection: "column", gap: 2 }}>
        <Typography variant="body3">
          <Trans id="controls.convert-unit.original">
            Original unit:{" "}
            {originalUnit || t({ id: "controls.none", message: "None" })}
          </Trans>
        </Typography>
        <Input
          type="number"
          label={t({
            id: "controls.convert-unit.multiplier",
            message: "Multiplier",
          })}
          name="multiplier"
          value={definedConversionUnit.multiplier}
          onChange={handleMultiplierChange}
        />
      </Flex>
      <Flex sx={{ flexDirection: "column", gap: 1 }}>
        <Typography variant="body3">
          <Trans id="controls.convert-unit.custom-labels">
            Custom unit labels
          </Trans>
        </Typography>
        {orderedLocales.map((locale) => (
          <Input
            key={locale}
            label={getFieldLabel(locale)}
            name={`unit-label-${locale}`}
            value={definedConversionUnit.labels[locale]}
            onChange={(e) => handleLabelChange(locale, e.target.value)}
          />
        ))}
      </Flex>
    </Box>
  );
};

const getDefaultConversionUnit = ({
  originalUnit,
}: {
  originalUnit: string | undefined;
}): ConversionUnit => {
  const label = originalUnit ?? "";

  return {
    multiplier: 1,
    labels: {
      de: label,
      fr: label,
      it: label,
      en: label,
    },
  };
};
