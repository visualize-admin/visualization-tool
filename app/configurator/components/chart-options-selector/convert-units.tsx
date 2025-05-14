import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import get from "lodash/get";
import { ChangeEvent } from "react";

import { EncodingFieldType } from "@/charts/chart-config-ui-options";
import Flex from "@/components/flex";
import { Checkbox, Input } from "@/components/form";
import {
  ChartConfig,
  ComboLineSingleFields,
  UnitConversionFieldExtension,
} from "@/config-types";
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

export const ConvertUnits = ({
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
    case "bar":
    case "column":
    case "line":
    case "pie":
    case "scatterplot": {
      const component = components.find(
        (c) => c.id === (chartConfig.fields as any)[field].componentId
      );

      return (
        <ConvertUnit
          chartConfig={chartConfig}
          field={field}
          path="unitConversion"
          originalUnit={component?.unit}
        />
      );
    }
    case "map":
    case "table":
      return null;
    case "comboLineSingle": {
      const component = components.find(
        (c) =>
          c.id ===
          (chartConfig.fields as ComboLineSingleFields).y.componentIds[0]
      );

      return (
        <ConvertUnit
          chartConfig={chartConfig}
          field="y"
          path="unitConversion"
          originalUnit={component?.unit}
        />
      );
    }
    case "comboLineColumn":
      return null;
    case "comboLineDual":
      return null;
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

export const ConvertUnit = ({
  chartConfig,
  field,
  path,
  originalUnit,
}: {
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  path: string;
  originalUnit: string | undefined;
}) => {
  const locale = useLocale();
  const orderedLocales = useOrderedLocales();
  const [_, dispatch] = useConfiguratorState(isConfiguring);

  const unitConversion = get(
    chartConfig,
    `fields["${field}"].${path}`
  ) as UnitConversionFieldExtension["unitConversion"];

  const handleToggle = useEvent(() => {
    if (!unitConversion) {
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
            factor: 1,
            labels: defaultLabels,
          },
        },
      });
    } else {
      dispatch({
        type: "CHART_FIELD_UPDATED",
        value: {
          locale,
          field,
          path,
          value: FIELD_VALUE_NONE,
        },
      });
    }
  });

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
    <ControlSection collapse defaultExpanded={!!unitConversion}>
      <SectionTitle iconName="balance">
        <Trans id="controls.convert-unit">Unit Conversion</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
        <Checkbox
          label={t({
            id: "controls.convert-unit.enable",
            message: "Enable unit conversion",
          })}
          checked={!!unitConversion}
          onChange={handleToggle}
        />
        {unitConversion ? (
          <Flex sx={{ flexDirection: "column", gap: 2, mt: 2 }}>
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
          </Flex>
        ) : null}
      </ControlSectionContent>
    </ControlSection>
  );
};
