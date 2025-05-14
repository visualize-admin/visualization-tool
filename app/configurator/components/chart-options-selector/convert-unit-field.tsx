import { t, Trans } from "@lingui/macro";
import { Box, Typography } from "@mui/material";
import { ChangeEvent, ReactNode } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import Flex from "@/components/flex";
import { Checkbox, Input } from "@/components/form";
import { ChartConfig, UnitConversionFieldExtension } from "@/config-types";
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
import { Locale } from "@/locales/locales";
import { useLocale, useOrderedLocales } from "@/locales/use-locale";
import useEvent from "@/utils/use-event";

export const ConvertUnitField = ({
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

      const unitConversion = chartConfig.fields.y.unitConversion;

      return (
        <ConvertUnitSection
          checked={!!unitConversion}
          field={field}
          unitConversions={[
            {
              path: "unitConversion",
              originalUnit: component.unit,
              componentId: component.id,
            },
          ]}
        >
          {unitConversion ? (
            <ConvertUnitInner
              field={field}
              path="unitConversion"
              originalUnit={component.unit}
              unitConversion={unitConversion}
            />
          ) : null}
        </ConvertUnitSection>
      );
    }
    case "bar": {
      const component = components.find(
        (c) => c.id === (chartConfig.fields as any)[field].componentId
      );

      if (!component) {
        return null;
      }

      const unitConversion = chartConfig.fields.x.unitConversion;

      return (
        <ConvertUnitSection
          checked={!!unitConversion}
          field={field}
          unitConversions={[
            {
              path: "unitConversion",
              originalUnit: component.unit,
              componentId: component.id,
            },
          ]}
        >
          {unitConversion ? (
            <ConvertUnitInner
              field={field}
              path="unitConversion"
              originalUnit={component.unit}
              unitConversion={unitConversion}
            />
          ) : null}
        </ConvertUnitSection>
      );
    }
    case "map":
    case "table":
      return null;
    case "comboLineSingle": {
      const component = components.find(
        (c) => c.id === chartConfig.fields.y.componentIds[0]
      );

      if (!component) {
        return null;
      }

      const unitConversion = chartConfig.fields.y.unitConversion;

      return (
        <ConvertUnitSection
          checked={!!unitConversion}
          field="y"
          unitConversions={[
            {
              path: "unitConversion",
              originalUnit: component.unit,
              componentId: component.id,
            },
          ]}
        >
          {unitConversion ? (
            <ConvertUnitInner
              field="y"
              path="unitConversion"
              originalUnit={component.unit}
              unitConversion={unitConversion}
            />
          ) : null}
        </ConvertUnitSection>
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

      const lineUnitConversion = chartConfig.fields.y.lineUnitConversion;
      const columnUnitConversion = chartConfig.fields.y.columnUnitConversion;

      return (
        <ConvertUnitSection
          checked={!!lineUnitConversion || !!columnUnitConversion}
          field="y"
          unitConversions={[
            {
              path: "lineUnitConversion",
              originalUnit: lineComponent.unit,
              componentId: lineComponent.id,
            },
            {
              path: "columnUnitConversion",
              originalUnit: columnComponent.unit,
              componentId: columnComponent.id,
            },
          ]}
        >
          {columnUnitConversion ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {columnComponent.label}
              </Typography>
              <ConvertUnitInner
                field="y"
                path="columnUnitConversion"
                originalUnit={columnComponent?.unit}
                unitConversion={columnUnitConversion}
              />
            </div>
          ) : null}
          {lineUnitConversion ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {lineComponent.label}
              </Typography>
              <ConvertUnitInner
                field="y"
                path="lineUnitConversion"
                originalUnit={lineComponent?.unit}
                unitConversion={lineUnitConversion}
              />
            </div>
          ) : null}
        </ConvertUnitSection>
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

      const leftUnitConversion = chartConfig.fields.y.leftAxisUnitConversion;
      const rightUnitConversion = chartConfig.fields.y.rightAxisUnitConversion;

      return (
        <ConvertUnitSection
          checked={!!leftUnitConversion || !!rightUnitConversion}
          field="y"
          unitConversions={[
            {
              path: "leftAxisUnitConversion",
              originalUnit: leftComponent.unit,
              componentId: leftComponent.id,
            },
            {
              path: "rightAxisUnitConversion",
              originalUnit: rightComponent.unit,
              componentId: rightComponent.id,
            },
          ]}
        >
          {leftUnitConversion ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {leftComponent.label}
              </Typography>
              <ConvertUnitInner
                field="y"
                path="leftAxisUnitConversion"
                originalUnit={leftComponent.unit}
                unitConversion={leftUnitConversion}
              />
            </div>
          ) : null}
          {rightUnitConversion ? (
            <div>
              <Typography variant="body3" fontWeight="bold">
                {rightComponent.label}
              </Typography>
              <ConvertUnitInner
                field="y"
                path="rightAxisUnitConversion"
                originalUnit={rightComponent.unit}
                unitConversion={rightUnitConversion}
              />
            </div>
          ) : null}
        </ConvertUnitSection>
      );
    }
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

const ConvertUnitSection = ({
  children,
  checked,
  field,
  unitConversions,
}: {
  children: ReactNode;
  checked: boolean;
  field: EncodingFieldType;
  unitConversions: {
    path: string;
    originalUnit: string | undefined;
    componentId: string;
  }[];
}) => {
  const locale = useLocale();
  const orderedLocales = useOrderedLocales();
  const [_, dispatch] = useConfiguratorState(isConfiguring);

  const handleToggle = useEvent(() => {
    if (!checked) {
      unitConversions.forEach(({ path, originalUnit, componentId }) => {
        const defaultLabels = orderedLocales.reduce(
          (acc, locale) => {
            acc[locale] = originalUnit ?? "";
            return acc;
          },
          {} as Record<Locale, string>
        );

        dispatch({
          type: "CHART_FIELD_UPDATED",
          value: {
            locale,
            field,
            path,
            value: {
              componentId,
              factor: 1,
              labels: defaultLabels,
            },
          },
        });
      });
    } else {
      unitConversions.forEach(({ path }) => {
        dispatch({
          type: "CHART_FIELD_UPDATED",
          value: {
            locale,
            field,
            path,
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

const ConvertUnitInner = ({
  field,
  path,
  originalUnit,
  unitConversion,
}: {
  field: EncodingFieldType;
  path: string;
  originalUnit: string | undefined;
  unitConversion: NonNullable<UnitConversionFieldExtension["unitConversion"]>;
}) => {
  const locale = useLocale();
  const orderedLocales = useOrderedLocales();
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const handleFactorChange = useEvent((e: ChangeEvent<HTMLInputElement>) => {
    const newFactor = +e.target.value;

    if (!isNaN(newFactor) && newFactor > 0 && unitConversion) {
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field,
          path,
          value: {
            componentId: unitConversion.componentId,
            factor: newFactor,
            labels: unitConversion.labels,
          },
        },
      });
    }
  });

  const handleLabelChange = useEvent((locale: Locale, value: string) => {
    if (unitConversion) {
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field,
          path,
          value: {
            componentId: unitConversion.componentId,
            factor: unitConversion.factor,
            labels: {
              ...unitConversion.labels,
              [locale]: value,
            },
          },
        },
      });
    }
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
            id: "controls.convert-unit.factor",
            message: "Multiplying factor",
          })}
          name="unit-factor"
          value={unitConversion.factor}
          onChange={handleFactorChange}
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
            value={unitConversion.labels[locale]}
            onChange={(e) => handleLabelChange(locale, e.target.value)}
          />
        ))}
      </Flex>
    </Box>
  );
};
