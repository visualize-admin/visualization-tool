import { t, Trans } from "@lingui/macro";
import {
  Box,
  Stack,
  Switch as MUISwitch,
  Tooltip,
  Typography,
} from "@mui/material";
import { groups } from "d3-array";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import dynamic from "next/dynamic";
import { ReactNode, useCallback, useEffect, useMemo } from "react";

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
import { LegendItem, LegendSymbol } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import {
  FieldSetLegend,
  Label,
  Radio,
  Select,
  SelectOption,
  SelectOptionGroup,
} from "@/components/form";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import { MaybeTooltip } from "@/components/maybe-tooltip";
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
  GenericField,
  ImputationType,
  imputationTypes,
  isAnimationInConfig,
  isBarConfig,
  isColorInConfig,
  isComboChartConfig,
  isMapConfig,
  isTableConfig,
  MapConfig,
  SortingType,
} from "@/config-types";
import {
  getAxisDimension,
  getChartConfig,
  getMaybeValidChartConfigLimit,
  getSupportsLimitSymbols,
  useChartConfigFilters,
} from "@/config-utils";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import { ColorRampField } from "@/configurator/components/chart-controls/color-ramp";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { CustomLayersSelector } from "@/configurator/components/custom-layers-selector";
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
import {
  isConfiguring,
  useConfiguratorState,
} from "@/configurator/configurator-state";
import { FIELD_VALUE_NONE } from "@/configurator/constants";
import { TableColumnOptions } from "@/configurator/table/table-chart-options";
import {
  Component,
  CUSTOM_SORT_ENABLED_COMPONENTS,
  DataCubeMetadata,
  Dimension,
  getComponentsFilteredByType,
  isMeasure,
  isNumericalMeasure,
  isStandardErrorDimension,
  isTemporalDimension,
  isTemporalEntityDimension,
  Measure,
  NumericalMeasure,
  Observation,
} from "@/domain/data";
import { truthy } from "@/domain/types";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { isJoinByCube } from "@/graphql/join";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
import { useLocale } from "@/locales/use-locale";
import { getPalette } from "@/palettes";
import { Limit } from "@/rdf/limits";
import useEvent from "@/utils/use-event";
import { useUserPalettes } from "@/utils/use-user-palettes";

const ColorPickerMenu = dynamic(
  () =>
    import("./chart-controls/color-picker").then((mod) => mod.ColorPickerMenu),
  { ssr: false }
);

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const chartConfig = getChartConfig(state);
  const { dataSource } = state;
  const { activeField } = chartConfig;
  const locale = useLocale();
  const [{ data: metadataData, fetching: fetchingMetadata }] =
    useDataCubesMetadataQuery({
      variables: {
        locale,
        sourceType: dataSource.type,
        sourceUrl: dataSource.url,
        cubeFilters: chartConfig.cubes.map((cube) => ({ iri: cube.iri })),
      },
    });
  const cubesMetadata = metadataData?.dataCubesMetadata;
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

  const fetching =
    fetchingMetadata || fetchingComponents || fetchingObservations;

  return cubesMetadata && dimensions && measures && observations ? (
    <Box
      sx={{
        // We need these overflow parameters to allow iOS scrolling.
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
            cubesMetadata={cubesMetadata}
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

const ActiveFieldSwitch = ({
  dimensions,
  measures,
  chartConfig,
  observations,
  cubesMetadata,
}: {
  chartConfig: ChartConfig;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[];
  cubesMetadata: DataCubeMetadata[];
}) => {
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
  const component = [...dimensions, ...measures].find(
    (d) => d.id === activeFieldComponentId
  );

  return (
    <EncodingOptionsPanel
      encoding={encoding}
      chartConfig={chartConfig}
      field={activeField}
      component={component}
      dimensions={dimensions}
      measures={measures}
      observations={observations}
      cubesMetadata={cubesMetadata}
    />
  );
};

const makeGetFieldOptionGroups =
  ({ cubesMetadata }: { cubesMetadata: DataCubeMetadata[] }) =>
  ({
    fieldComponents,
    getOption,
  }: {
    fieldComponents: Component[];
    getOption: (dim: Component) => SelectOption;
  }): SelectOptionGroup[] => {
    const fieldComponentsByCubeIri = groupBy(fieldComponents, (d) => d.cubeIri);

    return Object.entries(fieldComponentsByCubeIri).map(([cubeIri, dims]) => {
      return [
        {
          label: isJoinByCube(cubeIri)
            ? t({ id: "dimension.joined" })
            : cubesMetadata.find((d) => d.iri === cubeIri)?.title,
          value: cubeIri,
        },
        dims.map(getOption),
      ];
    });
  };

interface EncodingOptionsPanelProps {
  encoding: EncodingSpec;
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  component: Component | undefined;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[];
  cubesMetadata: DataCubeMetadata[];
}

const EncodingOptionsPanel = (props: EncodingOptionsPanelProps) => {
  const {
    encoding,
    field,
    chartConfig,
    component,
    dimensions,
    measures,
    observations,
    cubesMetadata,
  } = props;

  const { fields } = chartConfig;
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
    color: t({
      id: "controls.select.color",
      message: "Select a color",
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
  const otherFields = Object.keys(fields).filter(
    (f) => (fields as any)[f].hasOwnProperty("componentId") && field !== f
  );
  const otherFieldsIds = otherFields.map((f) => (fields as any)[f].componentId);

  const fieldComponents = useMemo(() => {
    return getComponentsFilteredByType({
      dimensionTypes: encoding.componentTypes,
      dimensions,
      measures,
    });
  }, [dimensions, encoding.componentTypes, measures]);

  const getFieldOptionGroups = useMemo(() => {
    return makeGetFieldOptionGroups({ cubesMetadata });
  }, [cubesMetadata]);

  const getOption = useCallback(
    (c: Component) => {
      return {
        value: c.id,
        label: getComponentLabel(c),
        disabled:
          ((encoding.exclusive === undefined || encoding.exclusive === true) &&
            otherFieldsIds.includes(c.id)) ||
          isStandardErrorDimension(c),
      } as SelectOption;
    },
    [encoding.exclusive, otherFieldsIds]
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

  const components = useMemo(() => {
    return [...measures, ...dimensions];
  }, [measures, dimensions]);

  const fieldComponent = useMemo(() => {
    const encodingId = (
      (fields as any)?.[encoding.field] as GenericField | undefined
    )?.componentId;

    return components.find((d) => d.id === encodingId);
  }, [components, fields, encoding.field]);

  const hasStandardError = useMemo(() => {
    return !!components.find((d) =>
      d.related?.some(
        (r) => r.type === "StandardError" && r.id === component?.id
      )
    );
  }, [components, component]);

  const hasConfidenceInterval = useMemo(() => {
    const upperBoundComponent = components.find((d) =>
      d.related?.some(
        (r) => r.type === "ConfidenceUpperBound" && r.id === component?.id
      )
    );
    const lowerBoundComponent = components.find((d) =>
      d.related?.some(
        (r) => r.type === "ConfidenceLowerBound" && r.id === component?.id
      )
    );

    return !!upperBoundComponent && !!lowerBoundComponent;
  }, [components, component]);

  const hasColorPalette = !!encoding.options?.colorPalette;

  const hasSubOptions = encoding.options?.chartSubType ?? false;

  const limitMeasure =
    isMapConfig(chartConfig) && chartConfig.activeField === "symbolLayer"
      ? measures.find((m) => m.id === chartConfig.fields.symbolLayer?.measureId)
      : isMeasure(component)
        ? component
        : undefined;

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
          <SectionTitle closable>
            {getFieldLabel(`${chartConfig.chartType}.${encoding.field}`)}
          </SectionTitle>
          <ControlSectionContent gap="none">
            {!encoding.customComponent && (
              <ChartFieldField
                field={encoding.field}
                label={fieldLabelHint[encoding.field]}
                optional={encoding.optional}
                options={options}
                optionGroups={optionGroups}
                components={components}
              />
            )}
            {encoding.options?.showValues ? (
              <SwitchWrapper>
                <ChartOptionCheckboxField
                  path="showValues"
                  field={encoding.field}
                  label={t({ id: "controls.section.show-values" })}
                  disabled={
                    encoding.options.showValues.getDisabledState?.(chartConfig)
                      .disabled
                  }
                />
              </SwitchWrapper>
            ) : null}
            {encoding.options?.showStandardError && hasStandardError && (
              <SwitchWrapper>
                <ChartOptionSwitchField
                  path="showStandardError"
                  field={encoding.field}
                  defaultValue
                  label={t({ id: "controls.section.show-standard-error" })}
                />
                <InfoIconTooltip
                  enterDelay={600}
                  PopperProps={{ sx: { maxWidth: 160 } }}
                  title={
                    <Trans id="controls.section.show-standard-error.explanation">
                      Show uncertainties extending from data points to represent
                      standard errors
                    </Trans>
                  }
                />
              </SwitchWrapper>
            )}
            {encoding.options?.showConfidenceInterval &&
              hasConfidenceInterval && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    mt: 3,
                  }}
                >
                  <ChartOptionSwitchField
                    path="showConfidenceInterval"
                    field={encoding.field}
                    defaultValue
                    label={t({
                      id: "controls.section.show-confidence-interval",
                    })}
                  />
                  <InfoIconTooltip
                    enterDelay={600}
                    PopperProps={{ sx: { maxWidth: 160 } }}
                    title={
                      <Trans id="controls.section.show-confidence-interval.explanation">
                        Show uncertainties extending from data points to
                        represent confidence intervals
                      </Trans>
                    }
                  />
                </Box>
              )}
            {encoding.options?.useAbbreviations && (
              <ControlSectionContent component="fieldset" gap="none" mt={3}>
                <ChartFieldAbbreviations
                  field={field}
                  component={fieldComponent}
                />
              </ControlSectionContent>
            )}
          </ControlSectionContent>
        </ControlSection>
      )}
      {encoding.options?.showDots && (
        <ChartShowDots fields={chartConfig.fields} field={field} />
      )}
      {isComboChartConfig(chartConfig) && encoding.field === "y" && (
        <ChartComboYField chartConfig={chartConfig} measures={measures} />
      )}
      {fieldComponent && (hasSubOptions || hasColorPalette) && (
        <ChartLayoutOptions
          encoding={encoding}
          component={component}
          chartConfig={chartConfig}
          components={components}
          hasColorPalette={hasColorPalette}
          hasSubOptions={!!hasSubOptions}
          measures={measures}
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
        <>
          <ChartMapBaseLayerSettings chartConfig={chartConfig as MapConfig} />
          <CustomLayersSelector />
        </>
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
          chartConfig={chartConfig}
          field={field}
          componentTypes={encoding.options.size.componentTypes}
          optional={encoding.options.size.optional}
          dimensions={dimensions}
          measures={measures}
          getFieldOptionGroups={getFieldOptionGroups}
        />
      )}
      {limitMeasure ? (
        <ChartLimits
          chartConfig={chartConfig}
          dimensions={dimensions}
          measure={limitMeasure}
        />
      ) : null}
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
          getFieldOptionGroups={getFieldOptionGroups}
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
      {fieldComponent &&
        field === "animation" &&
        isAnimationInConfig(chartConfig) &&
        chartConfig.fields.animation && (
          <ChartFieldAnimation field={chartConfig.fields.animation} />
        )}
    </div>
  );
};

const SwitchWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1,
        alignItems: "center",
        mt: 3,
      }}
    >
      {children}
    </Box>
  );
};

const ChartLayoutOptions = ({
  encoding,
  component,
  chartConfig,
  components,
  hasColorPalette,
  hasSubOptions,
  measures,
}: {
  encoding: EncodingSpec;
  component: Component | undefined;
  chartConfig: ChartConfig;
  components: Component[];
  hasColorPalette: boolean;
  hasSubOptions: boolean;
  measures: Measure[];
}) => {
  const activeField = chartConfig.activeField as EncodingFieldType | undefined;

  if (!activeField) {
    return null;
  }

  const hasColorField = isColorInConfig(chartConfig);
  const values: { id: string; symbol: LegendSymbol }[] = hasColorField
    ? chartConfig.fields.color.type === "single"
      ? [
          {
            id: isBarConfig(chartConfig)
              ? chartConfig.fields.x.componentId
              : chartConfig.fields.y.componentId,
            symbol: "line",
          },
        ]
      : Object.keys(chartConfig.fields.color.colorMapping).map((key) => ({
          id: key,
          symbol: "line",
        }))
    : [];

  return encoding.options || hasColorPalette ? (
    <ControlSection collapse>
      <SectionTitle iconName="color">
        <Trans id="controls.section.layout-options">Layout options</Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset">
        {hasSubOptions && (
          <ChartFieldOptions
            encoding={encoding}
            chartConfig={chartConfig}
            components={components}
            disabled={!component}
          />
        )}
        <ColorPalette
          field={activeField}
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
        {hasColorField && chartConfig.fields.color.type === "single" && (
          <ColorPickerField
            field="color"
            path="color"
            label={measures.find((d) => d.id === values[0].id)!.label}
          />
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};

const ChartLimits = ({
  chartConfig,
  dimensions,
  measure,
}: {
  chartConfig: ChartConfig;
  dimensions: Dimension[];
  measure: Measure;
}) => {
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const filters = useChartConfigFilters(chartConfig);
  const onToggle = useEvent((checked: boolean, limit: Limit) => {
    const actionProps = {
      measureId: measure.id,
      related: limit.related,
    };

    if (checked) {
      dispatch({
        type: "LIMIT_SET",
        value: {
          ...actionProps,
          color: "#ff0000",
          lineType: "solid",
        },
      });
    } else {
      dispatch({
        type: "LIMIT_REMOVE",
        value: actionProps,
      });
    }
  });
  const axisDimension = getAxisDimension({ chartConfig, dimensions });

  const availableLimitOptions = useMemo(() => {
    return measure.limits
      .map((limit) => {
        const { limit: maybeLimit, wouldBeValid } =
          getMaybeValidChartConfigLimit({
            chartConfig,
            measureId: measure.id,
            axisDimension,
            limit,
            filters,
          });

        if (!wouldBeValid) {
          return;
        }

        const {
          color = "#ffffff",
          lineType = "solid",
          symbolType = "circle",
        } = maybeLimit ?? {};

        return {
          limit,
          maybeLimit,
          color,
          lineType,
          symbolType,
        };
      })
      .filter(truthy);
  }, [axisDimension, chartConfig, filters, measure.id, measure.limits]);

  const { data: userPalettes } = useUserPalettes();
  const paletteId = get(chartConfig, "fields.color.paletteId");
  const colors = getPalette({
    paletteId,
    fallbackPalette: userPalettes?.find((d) => d.paletteId === paletteId)
      ?.colors,
  });
  const supportsLimitSymbols = getSupportsLimitSymbols(chartConfig);

  return availableLimitOptions.length > 0 ? (
    <ControlSection collapse>
      <SectionTitle iconName="target">
        <Trans id="controls.section.targets-and-limit-values">
          Targets & limit values
        </Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset">
        {availableLimitOptions.map(
          ({ maybeLimit, limit, color, lineType, symbolType }, i) => {
            return (
              <Box key={i} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    mb: limit.type === "range" || supportsLimitSymbols ? 4 : 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <MUISwitch
                      id={`limit-${i}`}
                      checked={!!maybeLimit}
                      onChange={(e) => {
                        onToggle(e.target.checked, limit);
                      }}
                    />
                    <Label htmlFor={`limit-${i}`}>
                      <Trans id="controls.section.targets-and-limit-values.show-target">
                        Show target
                      </Trans>
                    </Label>
                  </Box>
                  <Flex
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <LegendItem
                      item={limit.name}
                      color={color}
                      symbol="square"
                      usage="colorPicker"
                    />
                    <ColorPickerMenu
                      colors={colors}
                      selectedHexColor={color}
                      onChange={(color) => {
                        dispatch({
                          type: "LIMIT_SET",
                          value: {
                            measureId: measure.id,
                            related: limit.related,
                            color,
                            lineType,
                            symbolType,
                          },
                        });
                      }}
                      disabled={!maybeLimit}
                    />
                  </Flex>
                </Box>
                {limit.type === "single" && supportsLimitSymbols ? (
                  <div>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <Trans id="controls.section.targets-and-limit-values.symbol-type">
                        Select symbol type
                      </Trans>
                    </Typography>
                    <Radio
                      name={`limit-${i}-symbol-type-dot`}
                      label={t({ id: "controls.symbol.dot", message: "Dot" })}
                      value="dot"
                      checked={symbolType === "circle"}
                      onChange={() => {
                        dispatch({
                          type: "LIMIT_SET",
                          value: {
                            measureId: measure.id,
                            related: limit.related,
                            color,
                            lineType,
                            symbolType: "circle",
                          },
                        });
                      }}
                      disabled={!maybeLimit}
                    />
                    <Radio
                      name={`limit-${i}-symbol-type-cross`}
                      label={t({
                        id: "controls.symbol.cross",
                        message: "Cross",
                      })}
                      value="cross"
                      checked={symbolType === "cross"}
                      onChange={() => {
                        dispatch({
                          type: "LIMIT_SET",
                          value: {
                            measureId: measure.id,
                            related: limit.related,
                            color,
                            lineType,
                            symbolType: "cross",
                          },
                        });
                      }}
                      disabled={!maybeLimit}
                    />
                  </div>
                ) : null}
                {limit.type === "range" ? (
                  <div>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      <Trans id="controls.section.targets-and-limit-values.line-type">
                        Select line type
                      </Trans>
                    </Typography>
                    <Radio
                      name={`limit-${i}-line-type-solid`}
                      label={t({ id: "controls.line.solid", message: "Solid" })}
                      value="solid"
                      checked={lineType === "solid"}
                      onChange={() => {
                        dispatch({
                          type: "LIMIT_SET",
                          value: {
                            measureId: measure.id,
                            related: limit.related,
                            color,
                            lineType: "solid",
                            symbolType,
                          },
                        });
                      }}
                      disabled={!maybeLimit}
                    />
                    <Radio
                      name={`limit-${i}-line-type-dashed`}
                      label={t({
                        id: "controls.line.dashed",
                        message: "Dashed",
                      })}
                      value="dashed"
                      checked={lineType === "dashed"}
                      onChange={() => {
                        dispatch({
                          type: "LIMIT_SET",
                          value: {
                            measureId: measure.id,
                            related: limit.related,
                            color,
                            lineType: "dashed",
                            symbolType,
                          },
                        });
                      }}
                      disabled={!maybeLimit}
                    />
                  </div>
                ) : null}
              </Box>
            );
          }
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};

const ChartShowDots = ({
  fields,
  field,
}: {
  fields: ChartConfig["fields"];
  field: EncodingFieldType | null;
}) => {
  const locale = useLocale();
  const [_, dispatch] = useConfiguratorState(isConfiguring);
  const disabled =
    "y" in fields &&
    (!("showDots" in fields.y) ||
      ("showDots" in fields.y && !fields.y.showDots));

  return (
    <ControlSection collapse>
      <SectionTitle iconName="lineChart">
        <Trans id="controls.section.data-points">Data Points</Trans>
      </SectionTitle>
      <ControlSectionContent>
        <Stack direction="column" gap={4}>
          <ChartOptionSwitchField
            path="showDots"
            field={field}
            onChange={(e) => {
              const { checked } = e.target;
              if ("y" in fields && !("showDots" in fields.y)) {
                dispatch({
                  type: "COLOR_FIELD_UPDATED",
                  value: {
                    locale,
                    field: "y",
                    path: "showDotsSize",
                    value: "Large",
                  },
                });
              }
              dispatch({
                type: "COLOR_FIELD_UPDATED",
                value: {
                  locale,
                  field,
                  path: "showDots",
                  value: checked,
                },
              });
            }}
            label={t({ id: "controls.section.show-dots" })}
          />
          <Typography variant="caption" sx={{ mt: 2 }}>
            <Trans id="controls.section.dots-size">Select a Size</Trans>
          </Typography>
          <Flex justifyContent="flex-start">
            <ChartShowDotRadio
              size="Small"
              label={t({
                id: "controls.section.dots-size.small",
                message: "Small",
              })}
              disabled={disabled}
            />
            <ChartShowDotRadio
              size="Medium"
              label={t({
                id: "controls.section.dots-size.medium",
                message: "Medium",
              })}
              disabled={disabled}
            />
            <ChartShowDotRadio
              size="Large"
              label={t({
                id: "controls.section.dots-size.large",
                message: "Large",
              })}
              disabled={disabled}
            />
          </Flex>
        </Stack>
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartShowDotRadio = ({
  size,
  label,
  disabled,
}: {
  size: "Small" | "Medium" | "Large";
  label: string;
  disabled: boolean;
}) => {
  return (
    <ChartOptionRadioField
      key={size}
      field="y"
      path="showDotsSize"
      value={size}
      label={label}
      disabled={disabled}
    />
  );
};

const ChartFieldAbbreviations = ({
  field,
  path,
  component,
}: {
  field: EncodingFieldType;
  path?: string;
  component: Component | undefined;
}) => {
  const disabled = useMemo(() => {
    return !canUseAbbreviations(component);
  }, [component]);

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

const ChartComboYField = <T extends ComboChartConfig>({
  chartConfig,
  measures,
}: ChartComboYFieldProps<T>) => {
  switch (chartConfig.chartType) {
    case "comboLineSingle": {
      return (
        <ChartComboLineSingleYField
          chartConfig={chartConfig}
          measures={measures}
        />
      );
    }
    case "comboLineDual": {
      return (
        <ChartComboLineDualYField
          chartConfig={chartConfig}
          measures={measures}
        />
      );
    }
    case "comboLineColumn":
      return (
        <ChartComboLineColumnYField
          chartConfig={chartConfig}
          measures={measures}
        />
      );
    default:
      const _exhaustiveCheck: never = chartConfig;
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
  ).map(([unit, ms]) => {
    return [
      { label: unit, value: unit },
      ms.map((m) => {
        return {
          value: m.id,
          label: m.label,
          disabled: disable(m),
        };
      }),
    ];
  }) as SelectOptionGroup[];
};

const ChartComboLineSingleYField = ({
  chartConfig,
  measures,
}: ChartComboYFieldProps<ComboLineSingleConfig>) => {
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
                    type: "COLOR_FIELD_UPDATED",
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
                    type: "COLOR_FIELD_UPDATED",
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

const ChartComboLineDualYField = ({
  chartConfig,
  measures,
}: ChartComboYFieldProps<ComboLineDualConfig>) => {
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
                type: "COLOR_FIELD_UPDATED",
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
                type: "COLOR_FIELD_UPDATED",
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

const ChartComboLineColumnYField = ({
  chartConfig,
  measures,
}: ChartComboYFieldProps<ComboLineColumnConfig>) => {
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
            options={[]}
            optionGroups={getOptionGroups("column")}
            sortOptions={false}
            label={t({
              id: "controls.chart.combo.y.column-measure",
              message: "Left axis (column)",
            })}
            value={y.columnComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "COLOR_FIELD_UPDATED",
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
            options={[]}
            optionGroups={getOptionGroups("line")}
            sortOptions={false}
            label={t({
              id: "controls.chart.combo.y.line-measure",
              message: "Right axis (line)",
            })}
            value={y.lineComponentId}
            onChange={(e) => {
              const newId = e.target.value as string;
              dispatch({
                type: "COLOR_FIELD_UPDATED",
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
      <SectionTitle iconName="color">
        <Trans id="controls.section.layout-options">Layout options</Trans>
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
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 5 }}>
          {values.map(({ id, symbol }) => {
            return (
              <Box key={id}>
                <ColorPickerField
                  field="color"
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
      <SectionTitle iconName="animation">
        <Trans id="controls.section.animation.settings">
          Animation Settings
        </Trans>
      </SectionTitle>
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
                        <SvgIcInfoCircle width={16} height={16} />
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
                  <SvgIcInfoCircle width={16} height={16} />
                </Typography>
              </Tooltip>
            </Box>
          </>
        )}
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldMultiFilter = ({
  chartConfig,
  component,
  encoding,
  field,
  dimensions,
  measures,
}: {
  chartConfig: ChartConfig;
  component: Component | undefined;
  encoding: EncodingSpec;
  field: EncodingFieldType;
  dimensions: Dimension[];
  measures: Measure[];
}) => {
  const colorComponentId = get(
    chartConfig,
    isMapConfig(chartConfig)
      ? `fields["${field}"].color.componentId`
      : `fields.segment.componentId`
  );
  const colorComponent = [...dimensions, ...measures].find(
    (d) => d.id === colorComponentId
  );

  return encoding.filters && component ? (
    <ControlSection data-testid="chart-edition-multi-filters" collapse>
      <SectionTitle disabled={!component} iconName="filter">
        <Trans id="controls.section.filter">Filter</Trans>
      </SectionTitle>
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
              colorComponent={colorComponent}
              // If colorType is defined, we are dealing with color field and
              // not segment.
              colorConfigPath={
                isColorInConfig(chartConfig) ? undefined : "colorMapping"
              }
            />
          )
        )}
      </ControlSectionContent>
    </ControlSection>
  ) : null;
};

const ChartFieldOptions = ({
  encoding,
  chartConfig,
  components,
  disabled,
}: {
  encoding: EncodingSpec;
  chartConfig: ChartConfig;
  components: Component[];
  disabled?: boolean;
}) => {
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

const ChartFieldCalculation = ({
  disabled,
  warnMessage,
}: {
  disabled?: boolean;
  warnMessage?: string;
}) => {
  return (
    <ControlSection collapse>
      <SectionTitle
        iconName="normalize"
        disabled={disabled}
        warnMessage={warnMessage}
      >
        <Trans id="controls.select.calculation.mode">Chart mode</Trans>
      </SectionTitle>
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
            <MaybeTooltip
              tooltipProps={{ enterDelay: 600 }}
              title={
                <Trans id="controls.filters.interactive.calculation">
                  Allow users to change chart mode
                </Trans>
              }
            >
              <div>
                <Trans id="controls.filters.interactive.toggle">
                  Interactive
                </Trans>
              </div>
            </MaybeTooltip>
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

  const updateSortingOption = useCallback<
    (args: {
      sortingType: EncodingSortingOption["sortingType"];
      sortingOrder: "asc" | "desc";
    }) => void
  >(
    ({ sortingType, sortingOrder }) => {
      dispatch({
        type: "COLOR_FIELD_UPDATED",
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
      <SectionTitle disabled={disabled} iconName="sort">
        <Trans id="controls.section.sorting">Sort</Trans>
      </SectionTitle>
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
  chartConfig,
  field,
  componentTypes,
  dimensions,
  measures,
  getFieldOptionGroups,
  optional,
}: {
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  componentTypes: ComponentType[];
  dimensions: Dimension[];
  measures: Measure[];
  getFieldOptionGroups: ReturnType<typeof makeGetFieldOptionGroups>;
  optional: boolean;
}) => {
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

  return (
    <ControlSection collapse>
      <SectionTitle iconName="size">
        {t({
          id: "controls.size",
          message: "Size",
        })}
      </SectionTitle>
      <ControlSectionContent>
        <ChartOptionSelectField
          id="size-measure"
          label={t({
            id: "controls.select.measure",
            message: "Select a measure",
          })}
          field={field}
          path="measureId"
          options={options}
          optionGroups={optionGroups}
          optional={optional}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldColorComponent = ({
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
      <SectionTitle iconName="color">
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
            <ChartFieldAbbreviations
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

const ChartImputation = ({ chartConfig }: { chartConfig: ChartConfig }) => {
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
      <SectionTitle
        iconName="infoCircle"
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
      </SectionTitle>
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
          type: "COLOR_FIELD_UPDATED",
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
        type: "COLOR_FIELD_UPDATED",
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
    <ControlSection hideTopBorder>
      <SectionTitle>
        <Trans id="chart.map.layers.base">Base Layers</Trans>
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
