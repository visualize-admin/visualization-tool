import { t, Trans } from "@lingui/macro";
import { Typography } from "@mui/material";
import { groups } from "d3-array";
import { useCallback, useMemo } from "react";

import { LegendSymbol } from "@/charts/shared/legend-color";
import { Flex } from "@/components/flex";
import { Select, SelectOptionGroup } from "@/components/form";
import {
  ComboChartConfig,
  ComboLineColumnConfig,
  ComboLineDualConfig,
  ComboLineSingleConfig,
} from "@/config-types";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { ColorPickerField } from "@/configurator/components/field";
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import {
  Component,
  isNumericalMeasure,
  Measure,
  NumericalMeasure,
} from "@/domain/data";
import { useLocale } from "@/locales/use-locale";

type ComboYFieldProps<T extends ComboChartConfig> = {
  chartConfig: T;
  measures: Measure[];
};

export const ComboYField = <T extends ComboChartConfig>({
  chartConfig,
  measures,
}: ComboYFieldProps<T>) => {
  switch (chartConfig.chartType) {
    case "comboLineSingle": {
      return (
        <ComboLineSingleYField chartConfig={chartConfig} measures={measures} />
      );
    }
    case "comboLineDual": {
      return (
        <ComboLineDualYField chartConfig={chartConfig} measures={measures} />
      );
    }
    case "comboLineColumn":
      return (
        <ComboLineColumnYField chartConfig={chartConfig} measures={measures} />
      );
    default:
      const _exhaustiveCheck: never = chartConfig;
      return _exhaustiveCheck;
  }
};

const getComboOptionGroups = (
  measures: NumericalMeasure[],
  disable: (measure: NumericalMeasure) => boolean
) => {
  const noUnitLabel = t({
    id: "controls.chart.combo.y.no-unit",
    message: "No unit",
  });

  return groups(measures, (d) => d.unit ?? noUnitLabel).map(
    ([unit, measures]) => {
      return [
        { label: unit, value: unit },
        measures.map((measure) => {
          return {
            value: measure.id,
            label: measure.label,
            disabled: disable(measure),
          };
        }),
      ];
    }
  ) as SelectOptionGroup[];
};

const ComboLineSingleYField = ({
  chartConfig,
  measures,
}: ComboYFieldProps<ComboLineSingleConfig>) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const { fields } = chartConfig;
  const { y } = fields;

  const numericalMeasures = useMemo(() => {
    return measures.filter(isNumericalMeasure);
  }, [measures]);

  const unit = useMemo(() => {
    const uniqueUnits = Array.from(
      new Set(
        y.componentIds.map((id) => {
          const measure = numericalMeasures.find((m) => m.id === id);
          return measure?.unit;
        })
      )
    );

    if (uniqueUnits.length > 1) {
      throw Error("ChartComboYField can only be used with single-unit charts!");
    }

    return uniqueUnits[0];
  }, [numericalMeasures, y.componentIds]);

  const getOptionGroups = useCallback(
    (
      iri: string | null,
      {
        allowNone,
        enableAll,
      }: {
        allowNone?: boolean;
        enableAll?: boolean;
      } = {}
    ) => {
      const options = getComboOptionGroups(numericalMeasures, (m) => {
        return !m.unit
          ? true
          : enableAll
            ? false
            : m.unit !== unit ||
              (y.componentIds.includes(m.id) && m.id !== iri);
      });

      if (allowNone) {
        options.unshift([
          { label: "", value: "" },
          [
            {
              label: t({
                id: "controls.none",
                message: "None",
              }),
              value: FIELD_VALUE_NONE,
              isNoneValue: true,
            },
          ],
        ]);
      }

      return options;
    },
    [numericalMeasures, y.componentIds, unit]
  );

  const { addNewMeasureOptions, showAddNewMeasureButton } = useMemo(() => {
    const addNewMeasureOptions = getOptionGroups(null, { allowNone: true });

    return {
      addNewMeasureOptions,
      showAddNewMeasureButton:
        addNewMeasureOptions.flatMap(([_, v]) => v).filter((d) => !d.disabled)
          .length > 1,
    };
  }, [getOptionGroups]);

  return (
    <>
      <ControlSection collapse>
        <SectionTitle iconName="numerical">Measures</SectionTitle>
        <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 2 }}>
            <Trans id="controls.chart.combo.y.combine-same-unit">
              Note that you can only combine measures of the same unit.
            </Trans>
          </Typography>
          <Typography variant="caption" sx={{ mb: 2 }}>
            <Trans id="controls.chart.combo.y.common-unit">Common unit</Trans>:{" "}
            <b>{unit ?? t({ id: "controls.none", message: "None" })}</b>
          </Typography>
          {y.componentIds.map((id, i) => {
            // If there are multiple measures, we allow the user to remove any measure.
            const allowNone = y.componentIds.length > 1;
            // If there is only one measure, we allow the user to select any measure.
            const enableAll = i === 0 && y.componentIds.length === 1;
            const options = getOptionGroups(id, { allowNone, enableAll });

            return (
              <Select
                key={id}
                size="sm"
                id={`measure-${id}`}
                hint={
                  !showAddNewMeasureButton && y.componentIds.length === 1
                    ? t({
                        id: "controls.chart.combo.y.no-compatible-measures",
                        message: "No compatible measures to combine!",
                      })
                    : undefined
                }
                options={[]}
                optionGroups={options}
                sort={false}
                value={id}
                onChange={(e) => {
                  const newId = e.target.value as string;
                  let newComponentIds: string[];

                  if (newId === FIELD_VALUE_NONE) {
                    newComponentIds = y.componentIds.filter((d) => d !== id);
                  } else {
                    newComponentIds = [...y.componentIds];
                    newComponentIds.splice(i, 1, newId);
                  }

                  dispatch({
                    type: "CHART_FIELD_UPDATED",
                    value: {
                      locale,
                      field: "y",
                      path: "componentIds",
                      value: newComponentIds,
                    },
                  });
                }}
                sx={{ mb: 2 }}
              />
            );
          })}
          {showAddNewMeasureButton && (
            <Select
              id="measure-add"
              label={t({
                id: "controls.sorting.addDimension",
                message: "Add dimension",
              })}
              options={[]}
              optionGroups={addNewMeasureOptions}
              sort={false}
              onChange={(e) => {
                const id = e.target.value as string;

                if (id !== FIELD_VALUE_NONE) {
                  dispatch({
                    type: "CHART_FIELD_UPDATED",
                    value: {
                      locale,
                      field: "y",
                      path: "componentIds",
                      value: [...y.componentIds, id],
                    },
                  });
                }
              }}
              value={FIELD_VALUE_NONE}
            />
          )}
        </ControlSectionContent>
      </ControlSection>
      <ColorSelection
        values={y.componentIds.map((id) => ({ id, symbol: "line" }))}
        measures={measures}
      />
    </>
  );
};

const ComboLineDualYField = ({
  chartConfig,
  measures,
}: ComboYFieldProps<ComboLineDualConfig>) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const { fields } = chartConfig;
  const { y } = fields;

  const numericalMeasures = useMemo(() => {
    return measures.filter(isNumericalMeasure);
  }, [measures]);

  const { leftAxisMeasure, rightAxisMeasure } = useMemo(() => {
    const leftAxisMeasure = numericalMeasures.find(
      (m) => m.id === y.leftAxisComponentId
    ) as Measure;
    const rightAxisMeasure = numericalMeasures.find(
      (m) => m.id === y.rightAxisComponentId
    ) as Measure;

    return {
      leftAxisMeasure,
      rightAxisMeasure,
    };
  }, [numericalMeasures, y.leftAxisComponentId, y.rightAxisComponentId]);

  if (leftAxisMeasure.unit === rightAxisMeasure.unit) {
    throw Error("ChartComboYField can only be used with dual-unit charts!");
  }

  const getOptionGroups = useCallback(
    (orientation: "left" | "right") => {
      return getComboOptionGroups(numericalMeasures, (m) => {
        return orientation === "left"
          ? m.unit === rightAxisMeasure.unit
          : m.unit === leftAxisMeasure.unit;
      });
    },
    [leftAxisMeasure.unit, numericalMeasures, rightAxisMeasure.unit]
  );

  return (
    <>
      <ControlSection collapse>
        <SectionTitle iconName="numerical">Measures</SectionTitle>
        <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 4 }}>
            <Trans id="controls.chart.combo.y.combine-different-unit">
              Note that you can only combine measures of different units.
            </Trans>
          </Typography>
          <Select
            size="sm"
            id={`measure-${y.leftAxisComponentId}`}
            options={[]}
            optionGroups={getOptionGroups("left")}
            sort={false}
            label={t({
              id: "controls.chart.combo.y.left-axis-measure",
              message: "Left axis measure",
            })}
            value={y.leftAxisComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "CHART_FIELD_UPDATED",
                value: {
                  locale,
                  field: "y",
                  path: "leftAxisComponentId",
                  value: newId,
                },
              });
            }}
            sx={{ mb: 2 }}
          />
          <Select
            id={`measure-${y.rightAxisComponentId}`}
            size="sm"
            options={[]}
            optionGroups={getOptionGroups("right")}
            sort={false}
            label={t({
              id: "controls.chart.combo.y.right-axis-measure",
              message: "Right axis measure",
            })}
            value={y.rightAxisComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "CHART_FIELD_UPDATED",
                value: {
                  locale,
                  field: "y",
                  path: "rightAxisComponentId",
                  value: newId,
                },
              });
            }}
            sx={{ mb: 2 }}
          />
        </ControlSectionContent>
      </ControlSection>
      <ColorSelection
        values={[
          { id: y.leftAxisComponentId, symbol: "line" },
          { id: y.rightAxisComponentId, symbol: "line" },
        ]}
        measures={measures}
      />
    </>
  );
};

const ComboLineColumnYField = ({
  chartConfig,
  measures,
}: ComboYFieldProps<ComboLineColumnConfig>) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const { fields } = chartConfig;
  const { y } = fields;

  const numericalMeasures = useMemo(() => {
    return measures.filter(isNumericalMeasure);
  }, [measures]);

  const { lineMeasure, columnMeasure } = useMemo(() => {
    const lineMeasure = numericalMeasures.find(
      (m) => m.id === y.lineComponentId
    ) as Measure;
    const columnMeasure = numericalMeasures.find(
      (m) => m.id === y.columnComponentId
    ) as Measure;

    return {
      lineMeasure,
      columnMeasure,
    };
  }, [numericalMeasures, y.columnComponentId, y.lineComponentId]);

  if (lineMeasure.unit === columnMeasure.unit) {
    throw Error("ChartComboYField can only be used with dual-unit charts!");
  }

  const getOptionGroups = useCallback(
    (type: "line" | "column") => {
      return getComboOptionGroups(numericalMeasures, (m) => {
        return type === "line"
          ? m.unit === columnMeasure.unit
          : m.unit === lineMeasure.unit;
      });
    },
    [columnMeasure.unit, lineMeasure.unit, numericalMeasures]
  );

  return (
    <>
      <ControlSection collapse>
        <SectionTitle iconName="numerical">Measures</SectionTitle>
        <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 4 }}>
            <Trans id="controls.chart.combo.y.combine-different-unit">
              Note that you can only combine measures of different units.
            </Trans>
          </Typography>
          <Select
            id={`measure-${y.columnComponentId}`}
            size="sm"
            options={[]}
            optionGroups={getOptionGroups("column")}
            sort={false}
            label={t({
              id: "controls.chart.combo.y.column-measure",
              message: "Left axis (column)",
            })}
            value={y.columnComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "CHART_FIELD_UPDATED",
                value: {
                  locale,
                  field: "y",
                  path: "columnComponentId",
                  value: newId,
                },
              });
            }}
            sx={{ mb: 2 }}
          />
          <Select
            id={`measure-${y.lineComponentId}`}
            size="sm"
            options={[]}
            optionGroups={getOptionGroups("line")}
            sort={false}
            label={t({
              id: "controls.chart.combo.y.line-measure",
              message: "Right axis (line)",
            })}
            value={y.lineComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "CHART_FIELD_UPDATED",
                value: {
                  locale,
                  field: "y",
                  path: "lineComponentId",
                  value: newId,
                },
              });
            }}
            sx={{ mb: 2 }}
          />
        </ControlSectionContent>
      </ControlSection>
      <ColorSelection
        values={
          y.lineAxisOrientation === "left"
            ? [
                { id: y.lineComponentId, symbol: "line" },
                { id: y.columnComponentId, symbol: "square" },
              ]
            : [
                { id: y.columnComponentId, symbol: "square" },
                { id: y.lineComponentId, symbol: "line" },
              ]
        }
        measures={measures}
      />
    </>
  );
};

const ColorSelection = ({
  values,
  measures,
}: {
  values: { id: string; symbol: LegendSymbol }[];
  measures: Measure[];
}) => {
  return (
    <ControlSection collapse>
      <SectionTitle iconName="swatch">
        <Trans id="controls.section.layout-options">Layout Options</Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
        <ColorPalette
          field="y"
          component={
            {
              __typename: "",
              values: values.map(({ id }) => ({
                value: id,
                label: id,
              })),
            } as any as Component
          }
        />
        <Flex flexDirection="column" sx={{ gap: 2, mt: 5 }}>
          {values.map(({ id, symbol }) => {
            return (
              <div key={id}>
                <ColorPickerField
                  field="color"
                  path={`colorMapping["${id}"]`}
                  label={measures.find((d) => d.id === id)!.label}
                  symbol={symbol}
                />
              </div>
            );
          })}
        </Flex>
      </ControlSectionContent>
    </ControlSection>
  );
};
