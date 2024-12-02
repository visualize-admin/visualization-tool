import { t, Trans } from "@lingui/macro";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import { groups } from "d3-array";
import get from "lodash/get";
import { useCallback, useEffect, useMemo } from "react";

import { DEFAULT_SORTING, getFieldComponentId } from "@/charts";
import {
  ANIMATION_FIELD_SPEC,
  EncodingFieldType,
  EncodingOptionChartSubType,
  EncodingSortingOption,
  EncodingSpec,
  getChartSpec,
} from "@/charts/chart-config-ui-options";
import {
  DEFAULT_FIXED_COLOR_FIELD_OPACITY,
  DEFAULT_OTHER_COLOR_FIELD_OPACITY,
} from "@/charts/map/constants";
import { getMap } from "@/charts/map/ref";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { LegendSymbol } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import { FieldSetLegend, Radio, Select } from "@/components/form";
import { GenericField } from "@/config-types";
import {
  AnimationField,
  ChartConfig,
  ColorFieldType,
  ColorScaleType,
  ComboChartConfig,
  ComboLineColumnConfig,
  ComboLineDualConfig,
  ComboLineSingleConfig,
  ComponentType,
  ConfiguratorStateConfiguringChart,
  getChartConfig,
  ImputationType,
  imputationTypes,
  isAnimationInConfig,
  isComboChartConfig,
  isConfiguring,
  isTableConfig,
  MapConfig,
  Option,
  SortingType,
  useConfiguratorState,
} from "@/configurator";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import { ColorRampField } from "@/configurator/components/chart-controls/color-ramp";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
  SubsectionTitle,
} from "@/configurator/components/chart-controls/section";
import {
  ChartFieldField,
  ChartOptionCheckboxField,
  ChartOptionRadioField,
  ChartOptionSelectField,
  ChartOptionSliderField,
  ChartOptionSwitchField,
  ColorPickerField,
} from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import {
  DimensionValuesMultiFilter,
  TimeFilter,
} from "@/configurator/components/filters";
import {
  canUseAbbreviations,
  getComponentLabel,
} from "@/configurator/components/ui-helpers";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { TableColumnOptions } from "@/configurator/table/table-chart-options";
import {
  Component,
  CUSTOM_SORT_ENABLED_COMPONENTS,
  Dimension,
  getDimensionsByDimensionType,
  isMeasure,
  isNumericalMeasure,
  isStandardErrorDimension,
  isTemporalDimension,
  isTemporalEntityDimension,
  Measure,
  NumericalMeasure,
  Observation,
} from "@/domain/data";
import {
  useDataCubesComponentsQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import SvgIcInfoOutline from "@/icons/components/IcInfoOutline";
import { useLocale } from "@/locales/use-locale";

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const chartConfig = getChartConfig(state);
  const { dataSource } = state;
  const { activeField } = chartConfig;
  const locale = useLocale();
  const [{ data: componentsData, fetching: fetchingComponents }] =
    useDataCubesComponentsQuery({
      variables: {
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        locale,
        cubeFilters: chartConfig.cubes.map((cube) => ({
          iri: cube.iri,
          joinBy: cube.joinBy,
          loadValues: true,
        })),
      },
      keepPreviousData: true,
    });
  const dimensions = componentsData?.dataCubesComponents.dimensions;
  const measures = componentsData?.dataCubesComponents.measures;
  const queryFilters = useQueryFilters({
    chartConfig,
    dashboardFilters: state.dashboardFilters,
  });
  const [{ data: observationsData, fetching: fetchingObservations }] =
    useDataCubesObservationsQuery({
      variables: {
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        locale,
        cubeFilters: queryFilters,
      },
      pause: fetchingComponents,
      keepPreviousData: true,
    });
  const observations = observationsData?.dataCubesObservations?.data;
  const fetching = fetchingComponents || fetchingObservations;

  return dimensions && measures && observations ? (
    <Box
      sx={{
        // we need these overflow parameters to allow iOS scrolling
        overflowX: "hidden",
        overflowY: "auto",
        pointerEvents: fetching ? "none" : "auto",
        opacity: fetching ? 0.7 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {activeField ? (
        isTableConfig(chartConfig) ? (
          <TableColumnOptions
            state={state}
            dimensions={dimensions}
            measures={measures}
          />
        ) : (
          <ActiveFieldSwitch
            chartConfig={chartConfig}
            dimensions={dimensions}
            measures={measures}
            observations={observations}
          />
        )
      ) : null}
    </Box>
  ) : (
    <>
      <ControlSectionSkeleton />
      <ControlSectionSkeleton />
    </>
  );
};

type ActiveFieldSwitchProps = {
  chartConfig: ChartConfig;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[];
};

const ActiveFieldSwitch = (props: ActiveFieldSwitchProps) => {
  const { dimensions, measures, chartConfig, observations } = props;
  const activeField = chartConfig.activeField as EncodingFieldType | undefined;

  if (!activeField) {
    return null;
  }

  const chartSpec = getChartSpec(chartConfig);

  // Animation field is a special field that is not part of the encodings,
  // but rather is selected from interactive filters menu.
  const animatable =
    isAnimationInConfig(chartConfig) &&
    chartSpec.interactiveFilters.includes("animation");
  const baseEncodings = chartSpec.encodings;
  const encodings = animatable
    ? [...baseEncodings, ANIMATION_FIELD_SPEC]
    : baseEncodings;
  const encoding = encodings.find(
    (e) => e.field === activeField
  ) as EncodingSpec;

  const activeFieldComponentId = getFieldComponentId(
    chartConfig.fields,
    activeField
  );

  const components = [...dimensions, ...measures];
  const component = components.find((d) => d.id === activeFieldComponentId);

  return (
    <EncodingOptionsPanel
      encoding={encoding}
      chartConfig={chartConfig}
      field={activeField}
      component={component}
      dimensions={dimensions}
      measures={measures}
      observations={observations}
    />
  );
};

type EncodingOptionsPanelProps = {
  encoding: EncodingSpec;
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  component: Component | undefined;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[];
};

const EncodingOptionsPanel = (props: EncodingOptionsPanelProps) => {
  const {
    encoding,
    field,
    chartConfig,
    component,
    dimensions,
    measures,
    observations,
  } = props;
  const fieldLabelHint: Record<EncodingFieldType, string> = {
    animation: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
    x: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
    y: t({
      id: "controls.select.measure",
      message: "Select a measure",
    }),
    segment: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
    baseLayer: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
    areaLayer: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
    symbolLayer: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
  };

  const { fields } = chartConfig;
  const otherFields = Object.keys(fields).filter(
    (f) => (fields as any)[f].hasOwnProperty("componentId") && field !== f
  );
  const otherFieldsIds = otherFields.map((f) => (fields as any)[f].componentId);

  const options = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: encoding.componentTypes,
      dimensions,
      measures,
    }).map((d) => ({
      value: d.id,
      label: getComponentLabel(d),
      disabled:
        ((encoding.exclusive === undefined || encoding.exclusive === true) &&
          otherFieldsIds.includes(d.id)) ||
        isStandardErrorDimension(d),
    }));
  }, [
    dimensions,
    encoding.componentTypes,
    encoding.exclusive,
    measures,
    otherFieldsIds,
  ]);

  const allComponents = useMemo(() => {
    return [...measures, ...dimensions];
  }, [measures, dimensions]);

  const fieldDimension = useMemo(() => {
    const encodingId = (
      (fields as any)?.[encoding.field] as GenericField | undefined
    )?.componentId;

    return allComponents.find((d) => d.id === encodingId);
  }, [allComponents, fields, encoding.field]);

  const hasStandardError = useMemo(() => {
    return allComponents.find((d) =>
      d.related?.some(
        (r) => r.type === "StandardError" && r.id === component?.id
      )
    );
  }, [allComponents, component]);

  const hasColorPalette = !!encoding.options?.colorPalette;

  const hasSubOptions = encoding.options?.chartSubType ?? false;

  return (
    <div
      key={`control-panel-${encoding.field}`}
      role="tabpanel"
      id={`control-panel-${encoding.field}`}
      aria-labelledby={`tab-${encoding.field}`}
      tabIndex={-1}
    >
      {/* Only show component select if necessary */}
      {encoding.componentTypes.length > 0 && (
        <ControlSection hideTopBorder>
          <SectionTitle>{getFieldLabel(encoding.field)}</SectionTitle>
          <ControlSectionContent gap="none">
            {!encoding.customComponent && (
              <ChartFieldField
                field={encoding.field}
                label={fieldLabelHint[encoding.field]}
                optional={encoding.optional}
                options={options}
                components={allComponents}
              />
            )}
            {encoding.options?.showStandardError && hasStandardError && (
              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  alignItems: "center",
                  mt: 3,
                }}
              >
                <ChartOptionSwitchField
                  path="showStandardError"
                  field={encoding.field}
                  defaultValue={true}
                  label={t({ id: "controls.section.show-standard-error" })}
                  sx={{ marginRight: 0 }}
                />
                <Tooltip
                  enterDelay={600}
                  PopperProps={{ sx: { maxWidth: 160 } }}
                  title={
                    <Trans id="controls.section.show-standard-error.explanation">
                      Show uncertainties extending from data points to represent
                      standard errors
                    </Trans>
                  }
                >
                  <Box sx={{ color: "primary.main" }}>
                    <SvgIcInfoOutline width={16} height={16} />
                  </Box>
                </Tooltip>
              </Box>
            )}
            {encoding.options?.useAbbreviations && (
              <ControlSectionContent
                component="fieldset"
                gap="none"
                mt={3}
                px="small"
              >
                <ChartFieldAbbreviations
                  field={field}
                  dimension={fieldDimension}
                />
              </ControlSectionContent>
            )}
          </ControlSectionContent>
        </ControlSection>
      )}
      {isComboChartConfig(chartConfig) && encoding.field === "y" && (
        <ChartComboYField chartConfig={chartConfig} measures={measures} />
      )}
      {fieldDimension &&
        encoding.field === "segment" &&
        (hasSubOptions || hasColorPalette) && (
          <ChartLayoutOptions
            encoding={encoding}
            component={component}
            chartConfig={chartConfig}
            components={allComponents}
            hasColorPalette={hasColorPalette}
            hasSubOptions={!!hasSubOptions}
          />
        )}
      {encoding.options?.imputation?.shouldShow(chartConfig, observations) && (
        <ChartImputation chartConfig={chartConfig} />
      )}
      {encoding.options?.calculation && get(fields, "segment") && (
        <ChartFieldCalculation
          {...encoding.options.calculation.getDisabledState?.(chartConfig)}
        />
      )}
      {/* FIXME: should be generic or shouldn't be a field at all */}
      {field === "baseLayer" && (
        <ChartMapBaseLayerSettings chartConfig={chartConfig as MapConfig} />
      )}
      {encoding.sorting &&
        component &&
        CUSTOM_SORT_ENABLED_COMPONENTS.includes(component.__typename) && (
          <ChartFieldSorting
            chartConfig={chartConfig}
            field={field}
            encodingSortingOptions={encoding.sorting}
          />
        )}
      {encoding.options?.size && component && (
        <ChartFieldSize
          field={field}
          componentTypes={encoding.options.size.componentTypes}
          optional={encoding.options.size.optional}
          dimensions={dimensions}
          measures={measures}
        />
      )}
      {encoding.options?.colorComponent && component && (
        <ChartFieldColorComponent
          chartConfig={chartConfig}
          encoding={encoding}
          component={component}
          componentTypes={encoding.options.colorComponent.componentTypes}
          dimensions={dimensions}
          measures={measures}
          optional={encoding.options.colorComponent.optional}
          enableUseAbbreviations={
            encoding.options.colorComponent.enableUseAbbreviations
          }
        />
      )}
      <ChartFieldMultiFilter
        chartConfig={chartConfig}
        component={component}
        encoding={encoding}
        field={field}
        dimensions={dimensions}
        measures={measures}
      />
      {fieldDimension &&
        field === "animation" &&
        isAnimationInConfig(chartConfig) &&
        chartConfig.fields.animation && (
          <ChartFieldAnimation field={chartConfig.fields.animation} />
        )}
    </div>
  );
};

type ChartLayoutOptionsProps = {
  encoding: EncodingSpec;
  component: Component | undefined;
  chartConfig: ChartConfig;
  components: Component[];
  hasColorPalette: boolean;
  hasSubOptions: boolean;
};

const ChartLayoutOptions = (props: ChartLayoutOptionsProps) => {
  const {
    encoding,
    component,
    chartConfig,
    components,
    hasColorPalette,
    hasSubOptions,
  } = props;

  return encoding.options || hasColorPalette ? (
    <ControlSection collapse>
      <SubsectionTitle iconName="color">
        <Trans id="controls.section.layout-options">Layout options</Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset">
        {hasSubOptions && (
          <ChartFieldOptions
            encoding={encoding}
            chartConfig={chartConfig}
            components={components}
            disabled={!component}
          />
        )}
        {hasColorPalette && (
          <ColorPalette
            disabled={!component}
            field={encoding.field}
            component={component}
          />
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};

const ChartFieldAbbreviations = ({
  field,
  path,
  dimension,
}: {
  field: EncodingFieldType;
  path?: string;
  dimension: Component | undefined;
}) => {
  const disabled = useMemo(() => {
    return !canUseAbbreviations(dimension);
  }, [dimension]);

  return (
    <ChartOptionCheckboxField
      data-testid="use-abbreviations"
      label={getFieldLabel("abbreviations")}
      field={field}
      path={path ? `${path}.useAbbreviations` : "useAbbreviations"}
      disabled={disabled}
    />
  );
};

type ChartComboYFieldProps<T extends ComboChartConfig> = {
  chartConfig: T;
  measures: Measure[];
};

const ChartComboYField = (props: ChartComboYFieldProps<ComboChartConfig>) => {
  switch (props.chartConfig.chartType) {
    case "comboLineSingle": {
      const { chartConfig, ...rest } = props;
      return <ChartComboLineSingleYField chartConfig={chartConfig} {...rest} />;
    }
    case "comboLineDual": {
      const { chartConfig, ...rest } = props;
      return <ChartComboLineDualYField chartConfig={chartConfig} {...rest} />;
    }
    case "comboLineColumn":
      const { chartConfig, ...rest } = props;
      return <ChartComboLineColumnYField chartConfig={chartConfig} {...rest} />;
    default:
      const _exhaustiveCheck: never = props.chartConfig;
      return _exhaustiveCheck;
  }
};

const getComboOptionGroups = (
  measures: NumericalMeasure[],
  disable: (m: NumericalMeasure) => boolean
) => {
  return groups(
    measures,
    (d) =>
      d.unit ?? t({ id: "controls.chart.combo.y.no-unit", message: "No unit" })
  ).map(([k, v]) => {
    return [
      { label: k, value: k },
      v.map((m) => {
        return {
          value: m.id,
          label: m.label,
          disabled: disable(m),
        };
      }),
    ];
  }) as [Option, Option[]][];
};

const ChartComboLineSingleYField = (
  props: ChartComboYFieldProps<ComboLineSingleConfig>
) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const { chartConfig, measures } = props;
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
        <SubsectionTitle iconName="numerical">Measures</SubsectionTitle>
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

          {y.componentIds.map((id, index) => {
            // If there are multiple measures, we allow the user to remove any measure.
            const allowNone = y.componentIds.length > 1;
            // If there is only one measure, we allow the user to select any measure.
            const enableAll = index === 0 && y.componentIds.length === 1;
            const options = getOptionGroups(id, { allowNone, enableAll });

            return (
              <Select
                key={id}
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
                sortOptions={false}
                value={id}
                onChange={(e) => {
                  const newId = e.target.value as string;
                  let newComponentIds: string[];

                  if (newId === FIELD_VALUE_NONE) {
                    newComponentIds = y.componentIds.filter((d) => d !== id);
                  } else {
                    newComponentIds = [...y.componentIds];
                    newComponentIds.splice(index, 1, newId);
                  }

                  dispatch({
                    type: "CHART_OPTION_CHANGED",
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
              sortOptions={false}
              onChange={(e) => {
                const id = e.target.value as string;

                if (id !== FIELD_VALUE_NONE) {
                  dispatch({
                    type: "CHART_OPTION_CHANGED",
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
      <ComboChartYColorSection
        values={y.componentIds.map((id) => ({ id, symbol: "line" }))}
        measures={measures}
      />
    </>
  );
};

const ChartComboLineDualYField = (
  props: ChartComboYFieldProps<ComboLineDualConfig>
) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const { chartConfig, measures } = props;
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
        <SubsectionTitle iconName="numerical">Measures</SubsectionTitle>
        <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 4 }}>
            <Trans id="controls.chart.combo.y.combine-different-unit">
              Note that you can only combine measures of different units.
            </Trans>
          </Typography>

          <Select
            id={`measure-${y.leftAxisComponentId}`}
            options={[]}
            optionGroups={getOptionGroups("left")}
            sortOptions={false}
            label={t({
              id: "controls.chart.combo.y.left-axis-measure",
              message: "Left axis measure",
            })}
            value={y.leftAxisComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "CHART_OPTION_CHANGED",
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
            options={[]}
            optionGroups={getOptionGroups("right")}
            sortOptions={false}
            label={t({
              id: "controls.chart.combo.y.right-axis-measure",
              message: "Right axis measure",
            })}
            value={y.rightAxisComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "CHART_OPTION_CHANGED",
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
      <ComboChartYColorSection
        values={[
          { id: y.leftAxisComponentId, symbol: "line" },
          { id: y.rightAxisComponentId, symbol: "line" },
        ]}
        measures={measures}
      />
    </>
  );
};

const ChartComboLineColumnYField = (
  props: ChartComboYFieldProps<ComboLineColumnConfig>
) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState(isConfiguring);
  const { chartConfig, measures } = props;
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
        <SubsectionTitle iconName="numerical">Measures</SubsectionTitle>
        <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
          <Typography variant="caption" sx={{ mb: 4 }}>
            <Trans id="controls.chart.combo.y.combine-different-unit">
              Note that you can only combine measures of different units.
            </Trans>
          </Typography>

          <Select
            id={`measure-${y.columnComponentId}`}
            options={[]}
            optionGroups={getOptionGroups("column")}
            sortOptions={false}
            label={t({
              id: "controls.chart.combo.y.column-measure",
              message: "Left axis (column)",
            })}
            value={y.columnComponentId}
            onChange={(e) => {
              const newIri = e.target.value as string;
              dispatch({
                type: "CHART_OPTION_CHANGED",
                value: {
                  locale,
                  field: "y",
                  path: "columnComponentId",
                  value: newIri,
                },
              });
            }}
            sx={{ mb: 2 }}
          />

          <Select
            id={`measure-${y.lineComponentId}`}
            options={[]}
            optionGroups={getOptionGroups("line")}
            sortOptions={false}
            label={t({
              id: "controls.chart.combo.y.line-measure",
              message: "Right axis (line)",
            })}
            value={y.lineComponentId}
            onChange={(e) => {
              const newIri = e.target.value as string;
              dispatch({
                type: "CHART_OPTION_CHANGED",
                value: {
                  locale,
                  field: "y",
                  path: "lineComponentId",
                  value: newIri,
                },
              });
            }}
            sx={{ mb: 2 }}
          />
        </ControlSectionContent>
      </ControlSection>
      <ComboChartYColorSection
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

const ComboChartYColorSection = ({
  values,
  measures,
}: {
  values: { id: string; symbol: LegendSymbol }[];
  measures: Measure[];
}) => {
  return (
    <ControlSection collapse>
      <SubsectionTitle iconName="color">
        <Trans id="controls.section.layout-options">Layout options</Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
        <ColorPalette
          field="y"
          // Faking a component here, because we don't have a real one.
          // We use measure iris as dimension values, because that's how
          // the color mapping is done.
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 5 }}>
          {values.map(({ id, symbol }) => {
            return (
              <Box key={id}>
                <ColorPickerField
                  field="y"
                  path={`colorMapping["${id}"]`}
                  label={measures.find((d) => d.id === id)!.label}
                  symbol={symbol}
                />
              </Box>
            );
          })}
        </Box>
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldAnimation = ({ field }: { field: AnimationField }) => {
  return (
    <ControlSection collapse>
      <SubsectionTitle iconName="animation">
        <Trans id="controls.section.animation.settings">
          Animation Settings
        </Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset" gap="none" sx={{ mt: 2 }}>
        <ChartOptionSwitchField
          label={t({
            id: "controls.section.animation.show-play-button",
            message: "Show Play button",
          })}
          field="animation"
          path="showPlayButton"
        />
        {field.showPlayButton && (
          <>
            <Box component="fieldset" mt={4}>
              <FieldSetLegend
                legendTitle={
                  <Trans id="controls.section.animation.duration">
                    Animation Duration
                  </Trans>
                }
              />
              <Flex sx={{ justifyContent: "flex-start" }}>
                {[10, 30, 60].map((d) => (
                  <ChartOptionRadioField
                    key={d}
                    label={`${d}s`}
                    field="animation"
                    path="duration"
                    value={d}
                  />
                ))}
              </Flex>
            </Box>
            <Box component="fieldset" mt={4}>
              <FieldSetLegend
                legendTitle={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Trans id="controls.section.animation.type">
                      Animation Type
                    </Trans>
                    <Tooltip
                      arrow
                      title={t({
                        id: "controls.section.animation.type.explanation",
                        message:
                          "Use the Stepped type to make the animation jump between data points at fixed intervals. This mode is useful when you want to animate data using a time dimension with a non-uniform distribution of dates.",
                      })}
                    >
                      <Typography sx={{ color: "primary.main" }}>
                        <SvgIcInfoOutline width={16} height={16} />
                      </Typography>
                    </Tooltip>
                  </Box>
                }
              />
              <Flex justifyContent="flex-start">
                <ChartOptionRadioField
                  label={t({
                    id: "controls.section.animation.type.continuous",
                    message: "Continuous",
                  })}
                  field="animation"
                  path="type"
                  value="continuous"
                />
                <ChartOptionRadioField
                  label={t({
                    id: "controls.section.animation.type.stepped",
                    message: "Stepped",
                  })}
                  field="animation"
                  path="type"
                  value="stepped"
                />
              </Flex>
            </Box>
            <Box display="flex" alignItems="center" mt={5} gap="0.5rem">
              <ChartOptionSwitchField
                sx={{ mr: 0 }}
                label={t({
                  id: "controls.section.animation.dynamic-scaling",
                  message: "Dynamic Scaling",
                })}
                field="animation"
                path="dynamicScales"
              />
              <Tooltip
                arrow
                title={t({
                  id: "controls.section.animation.dynamic-scaling.explanation",
                  message:
                    "Enable dynamic scaling to adjust the chart's scale based on the data range, ensuring optimal visualization.",
                })}
              >
                <Typography color="primary.main">
                  <SvgIcInfoOutline width={16} height={16} />
                </Typography>
              </Tooltip>
            </Box>
          </>
        )}
      </ControlSectionContent>
    </ControlSection>
  );
};

type ChartFieldMultiFilterProps = {
  chartConfig: ChartConfig;
  component: Component | undefined;
  encoding: EncodingSpec;
  field: EncodingFieldType;
  dimensions: Dimension[];
  measures: Measure[];
};

const ChartFieldMultiFilter = (props: ChartFieldMultiFilterProps) => {
  const { chartConfig, component, encoding, field, dimensions, measures } =
    props;
  const colorComponentId = get(
    chartConfig,
    `fields["${field}"].color.componentId`
  );
  const colorComponent = [...dimensions, ...measures].find(
    (d) => d.id === colorComponentId
  );
  const colorType = get(chartConfig, `fields["${field}"].color.type`) as
    | ColorFieldType
    | undefined;

  return encoding.filters && component ? (
    <ControlSection data-testid="chart-edition-multi-filters" collapse>
      <SubsectionTitle
        disabled={!component}
        iconName="filter"
        gutterBottom={false}
      >
        <Trans id="controls.section.filter">Filter</Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset" gap="none">
        <legend style={{ display: "none" }}>
          <Trans id="controls.section.filter">Filter</Trans>
        </legend>
        {/* For temporal-based segments, we want to treat values as nominal. */}
        {(isTemporalDimension(component) ||
          isTemporalEntityDimension(component)) &&
        field !== "segment" ? (
          <TimeFilter
            dimension={component}
            disableInteractiveFilters={encoding.disableInteractiveFilters}
          />
        ) : (
          component &&
          !isMeasure(component) && (
            <DimensionValuesMultiFilter
              dimension={component}
              field={field}
              colorComponent={colorComponent ?? component}
              // If colorType is defined, we are dealing with color field and
              // not segment.
              colorConfigPath={colorType ? "color" : undefined}
            />
          )
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};

type ChartFieldOptionsProps = {
  encoding: EncodingSpec;
  chartConfig: ChartConfig;
  components: Component[];
  disabled?: boolean;
};

const ChartFieldOptions = (props: ChartFieldOptionsProps) => {
  const { encoding, chartConfig, components, disabled } = props;
  const chartSubType = encoding.options
    ?.chartSubType as EncodingOptionChartSubType;
  const values = chartSubType.getValues(chartConfig, components);

  return (
    <div>
      <Box component="fieldset" mt={2}>
        <FieldSetLegend
          legendTitle={
            <Trans id="controls.select.column.layout">Column layout</Trans>
          }
        />
        <Flex sx={{ justifyContent: "flex-start" }}>
          {values.map((d) => (
            <ChartOptionRadioField
              key={d.value}
              label={getFieldLabel(d.value)}
              field={encoding.field}
              path="type"
              value={d.value}
              disabled={disabled || d.disabled}
              warnMessage={d.warnMessage}
            />
          ))}
        </Flex>
      </Box>
    </div>
  );
};

type ChartFieldCalculationProps = {
  disabled?: boolean;
  warnMessage?: string;
};

const ChartFieldCalculation = (props: ChartFieldCalculationProps) => {
  const { disabled, warnMessage } = props;

  return (
    <ControlSection collapse>
      <SubsectionTitle
        iconName="normalize"
        disabled={disabled}
        warnMessage={warnMessage}
      >
        <Trans id="controls.select.calculation.mode">Chart mode</Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset">
        <Flex sx={{ justifyContent: "flex-start", my: 2 }}>
          <ChartOptionRadioField
            label={getFieldLabel("identity")}
            field={null}
            path="interactiveFiltersConfig.calculation.type"
            value="identity"
            disabled={disabled}
          />
          <ChartOptionRadioField
            label={getFieldLabel("percent")}
            field={null}
            path="interactiveFiltersConfig.calculation.type"
            value="percent"
            disabled={disabled}
          />
        </Flex>
        <ChartOptionSwitchField
          label={
            <Tooltip
              enterDelay={600}
              title={
                <Typography variant="body2">
                  <Trans id="controls.filters.interactive.calculation">
                    Allow users to change chart mode
                  </Trans>
                </Typography>
              }
            >
              <div>
                <Trans id="controls.filters.interactive.toggle">
                  Interactive
                </Trans>
              </div>
            </Tooltip>
          }
          field={null}
          path="interactiveFiltersConfig.calculation.active"
          disabled={disabled}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldSorting = ({
  chartConfig,
  field,
  encodingSortingOptions,
  disabled = false,
}: {
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  encodingSortingOptions: EncodingSortingOption[];
  disabled?: boolean;
}) => {
  const locale = useLocale();
  const [, dispatch] = useConfiguratorState();

  const getSortingTypeLabel = (type: SortingType): string => {
    switch (type) {
      case "byDimensionLabel":
        return t({ id: "controls.sorting.byDimensionLabel", message: `Name` });
      case "byMeasure":
        return t({ id: "controls.sorting.byMeasure", message: `Measure` });
      case "byTotalSize":
        return t({ id: "controls.sorting.byTotalSize", message: `Total size` });
      case "byAuto":
        return t({ id: "controls.sorting.byAuto", message: `Automatic` });
      default:
        const _sanityCheck: never = type;
        console.warn(`Sorting type label is ${_sanityCheck}`);
        return getSortingTypeLabel(DEFAULT_SORTING["sortingType"]);
    }
  };

  // Always update BOTH
  const updateSortingOption = useCallback<
    (args: {
      sortingType: EncodingSortingOption["sortingType"];
      sortingOrder: "asc" | "desc";
    }) => void
  >(
    ({ sortingType, sortingOrder }) => {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          field,
          path: "sorting",
          value: { sortingType, sortingOrder },
        },
      });
    },
    [locale, dispatch, field]
  );

  const activeSortingType = get(
    chartConfig,
    ["fields", field, "sorting", "sortingType"],
    DEFAULT_SORTING["sortingType"]
  );

  // FIXME: Remove this once it's properly encoded in chart-config-ui-options
  const sortingOrderOptions = encodingSortingOptions.find(
    (o) => o.sortingType === activeSortingType
  )?.sortingOrder;
  const activeSortingOrder = get(
    chartConfig,
    ["fields", field, "sorting", "sortingOrder"],
    sortingOrderOptions?.[0] ?? "asc"
  );

  return (
    <ControlSection collapse>
      <SubsectionTitle disabled={disabled} iconName="sort">
        <Trans id="controls.section.sorting">Sort</Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset">
        <Box>
          <Select
            id="sort-by"
            label={getFieldLabel("sortBy")}
            options={encodingSortingOptions?.map((d) => {
              const disabledState = d.getDisabledState?.(chartConfig);

              return {
                value: d.sortingType,
                label: getSortingTypeLabel(d.sortingType),
                ...disabledState,
              };
            })}
            value={activeSortingType}
            disabled={disabled}
            onChange={(e) => {
              updateSortingOption({
                sortingType: e.target
                  .value as EncodingSortingOption["sortingType"],
                sortingOrder: activeSortingOrder,
              });
            }}
          />
        </Box>
        <Flex sx={{ justifyContent: "flex-start", flexWrap: "wrap" }} mt={1}>
          {sortingOrderOptions &&
            sortingOrderOptions.map((sortingOrder) => {
              const subType = get(
                chartConfig,
                ["fields", "segment", "type"],
                ""
              );
              const chartSubType = `${chartConfig.chartType}.${subType}`;

              return (
                <Radio
                  key={sortingOrder}
                  label={getFieldLabel(
                    `${chartSubType}.${activeSortingType}.${sortingOrder}`
                  )}
                  value={sortingOrder}
                  checked={sortingOrder === activeSortingOrder}
                  disabled={disabled}
                  onChange={(e) => {
                    if (e.currentTarget.checked) {
                      updateSortingOption({
                        sortingType: activeSortingType,
                        sortingOrder,
                      });
                    }
                  }}
                />
              );
            })}
        </Flex>
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldSize = ({
  field,
  componentTypes,
  dimensions,
  measures,
  optional,
}: {
  field: EncodingFieldType;
  componentTypes: ComponentType[];
  dimensions: Dimension[];
  measures: Measure[];
  optional: boolean;
}) => {
  const measuresOptions = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: componentTypes,
      dimensions,
      measures,
    }).map(({ id, label }) => ({ value: id, label }));
  }, [dimensions, measures, componentTypes]);

  return (
    <ControlSection collapse>
      <SubsectionTitle iconName="size">
        {t({
          id: "controls.size",
          message: "Size",
        })}
      </SubsectionTitle>
      <ControlSectionContent>
        <ChartOptionSelectField
          id="size-measure"
          label={t({
            id: "controls.select.measure",
            message: "Select a measure",
          })}
          field={field}
          path="measureId"
          options={measuresOptions}
          isOptional={optional}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

type ChartFieldColorComponentProps = {
  chartConfig: ChartConfig;
  encoding: EncodingSpec;
  component: Component;
  componentTypes: ComponentType[];
  dimensions: Dimension[];
  measures: Measure[];
  optional: boolean;
  enableUseAbbreviations: boolean;
};

const ChartFieldColorComponent = (props: ChartFieldColorComponentProps) => {
  const {
    chartConfig,
    encoding,
    component,
    componentTypes,
    dimensions,
    measures,
    optional,
    enableUseAbbreviations,
  } = props;
  const field = encoding.field;
  const nbOptions = component.values.length;
  const measuresOptions = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: componentTypes,
      dimensions,
      measures,
    }).map(({ id, label }) => ({ value: id, label }));
  }, [dimensions, measures, componentTypes]);
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
      <SubsectionTitle iconName="color">
        <Trans id="controls.color">Color</Trans>
      </SubsectionTitle>
      <ControlSectionContent>
        <ChartOptionSelectField
          id="color-component"
          label={t({
            id: "controls.select.measure",
            message: "Select a measure",
          })}
          field={field}
          path="color.componentId"
          options={measuresOptions}
          isOptional={optional}
        />
        {enableUseAbbreviations && (
          <Box sx={{ mt: 1 }}>
            <ChartFieldAbbreviations
              field={field}
              path="color"
              dimension={colorComponent}
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
          ) : null
        ) : colorType === "numerical" ? (
          <div>
            <ColorRampField
              field={field}
              path="color.palette"
              nSteps={nbClass}
            />
            <FieldSetLegend
              legendTitle={t({
                id: "controls.scale.type",
                message: "Scale type",
              })}
            />
            <Flex sx={{ justifyContent: "flex-start" }}>
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
            </Flex>
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

type ChartImputationProps = {
  chartConfig: ChartConfig;
};

const ChartImputation = (props: ChartImputationProps) => {
  const { chartConfig } = props;
  const [, dispatch] = useConfiguratorState();
  const getImputationTypeLabel = (type: ImputationType) => {
    switch (type) {
      case "none":
        return t({
          id: "controls.imputation.type.none",
          message: "-",
        });
      case "zeros":
        return t({
          id: "controls.imputation.type.zeros",
          message: "Zeros",
        });
      case "linear":
        return t({
          id: "controls.imputation.type.linear",
          message: "Linear interpolation",
        });
      default:
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
    }
  };
  const updateImputationType = useCallback<(type: ImputationType) => void>(
    (type) => {
      dispatch({
        type: "IMPUTATION_TYPE_CHANGED",
        value: {
          type,
        },
      });
    },
    [dispatch]
  );

  const imputationType: ImputationType = get(
    chartConfig,
    ["fields", "y", "imputationType"],
    "none"
  );

  return (
    <ControlSection collapse>
      <SubsectionTitle
        iconName="info"
        warnMessage={
          imputationType === "none"
            ? t({
                id: "controls.section.imputation.explanation",
                message:
                  "For this chart type, replacement values should be assigned to missing values. Decide on the imputation logic or switch to another chart type.",
              })
            : undefined
        }
      >
        <Trans id="controls.section.imputation">Missing values</Trans>
      </SubsectionTitle>
      <ControlSectionContent component="fieldset" gap="none">
        <Select
          id="imputation-type"
          label={getFieldLabel("imputation")}
          options={imputationTypes.map((d) => ({
            value: d,
            label: getImputationTypeLabel(d),
          }))}
          value={imputationType}
          onChange={(e) => {
            updateImputationType(e.target.value as ImputationType);
          }}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartMapBaseLayerSettings = ({
  chartConfig,
}: {
  chartConfig: MapConfig;
}) => {
  const locale = useLocale();
  const [_, dispatch] = useConfiguratorState(isConfiguring);

  useEffect(() => {
    const map = getMap();

    if (chartConfig.baseLayer.locked) {
      if (map !== null) {
        dispatch({
          type: "CHART_OPTION_CHANGED",
          value: {
            locale,
            field: null,
            // FIXME: shouldn't be a field if not mapped to a component
            path: "baseLayer.bbox",
            value: map.getBounds().toArray(),
          },
        });
      }
    } else {
      dispatch({
        type: "CHART_OPTION_CHANGED",
        value: {
          locale,
          field: null,
          path: "baseLayer.bbox",
          value: undefined,
        },
      });
    }
  }, [chartConfig.baseLayer.locked, dispatch, locale]);

  return (
    <ControlSection>
      <SectionTitle>
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
};
