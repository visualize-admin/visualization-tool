import { t, Trans } from "@lingui/macro";
import { Box, Stack, Tooltip, Typography } from "@mui/material";
import get from "lodash/get";
import groupBy from "lodash/groupBy";
import { ReactNode, useCallback, useMemo } from "react";

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
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import { LegendSymbol } from "@/charts/shared/legend-color";
import Flex from "@/components/flex";
import { RadioGroup } from "@/components/form";
import {
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
  RegularChartConfig,
  SortingType,
} from "@/config-types";
import { getChartConfig } from "@/config-utils";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import { ColorRampField } from "@/configurator/components/chart-controls/color-ramp";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { BaseLayerField } from "@/configurator/components/chart-options-selector/base-layer-field";
import { ComboYField } from "@/configurator/components/chart-options-selector/combo-y-field";
import { ConversionUnitsField } from "@/configurator/components/chart-options-selector/conversion-units-field";
import { LimitsField } from "@/configurator/components/chart-options-selector/limits-field";
import { ScaleDomain } from "@/configurator/components/chart-options-selector/scale-domain";
import { ShowDotsField } from "@/configurator/components/chart-options-selector/show-dots-field";
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
import { useConfiguratorState } from "@/configurator/configurator-state";
import { TableColumnOptions } from "@/configurator/table/table-chart-options";
import {
  Component,
  CUSTOM_SORT_ENABLED_COMPONENTS,
  DataCubeMetadata,
  Dimension,
  getComponentsFilteredByType,
  isMeasure,
  isStandardErrorDimension,
  isTemporalDimension,
  isTemporalEntityDimension,
  Measure,
  Observation,
} from "@/domain/data";
import { useFlag } from "@/flags";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
import { isJoinByCube } from "@/graphql/join";
import SvgIcInfoCircle from "@/icons/components/IcInfoCircle";
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
      chartConfig,
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
      chartConfig,
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

const EncodingOptionsPanel = ({
  encoding,
  field,
  chartConfig,
  component,
  dimensions,
  measures,
  observations,
  cubesMetadata,
}: {
  encoding: EncodingSpec;
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  component: Component | undefined;
  dimensions: Dimension[];
  measures: Measure[];
  observations: Observation[];
  cubesMetadata: DataCubeMetadata[];
}) => {
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
    customLayers: t({
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

  const chartScaleDomainEnabled = useFlag("custom-scale-domain");
  const unitConversionEnabled = useFlag("convert-units");

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
          <ControlSectionContent gap="large">
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
              <ChartOptionCheckboxField
                path="showValues"
                field={encoding.field}
                label={t({ id: "controls.section.show-total-values" })}
                disabled={
                  encoding.options.showValues.getDisabledState?.(chartConfig)
                    .disabled
                }
              />
            ) : null}
            {encoding.options?.adjustScaleDomain &&
            fieldComponent &&
            chartScaleDomainEnabled ? (
              <ScaleDomain
                chartConfig={chartConfig}
                field={field}
                observations={observations}
                getDefaultDomain={
                  encoding.options.adjustScaleDomain.getDefaultDomain
                }
              />
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
              <ChartFieldAbbreviations
                field={field}
                component={fieldComponent}
              />
            )}
          </ControlSectionContent>
        </ControlSection>
      )}
      {encoding.options?.showDots && (
        <ShowDotsField fields={chartConfig.fields} field={field} />
      )}
      {isComboChartConfig(chartConfig) && encoding.field === "y" && (
        <ComboYField chartConfig={chartConfig} measures={measures} />
      )}
      {fieldComponent && (hasSubOptions || hasColorPalette) && (
        <ChartLayoutOptions
          encoding={encoding}
          component={component}
          // Combo charts use their own drawer.
          chartConfig={chartConfig as RegularChartConfig}
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
      {field === "baseLayer" && (
        <BaseLayerField chartConfig={chartConfig as MapConfig} />
      )}
      {field === "customLayers" && <CustomLayersSelector />}
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
        <LimitsField
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
      {unitConversionEnabled && encoding.options?.convertUnit && (
        <ConversionUnitsField
          chartConfig={chartConfig}
          field={field}
          components={components}
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
  return <Flex sx={{ alignItems: "center", gap: 1 }}>{children}</Flex>;
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
  chartConfig: RegularChartConfig;
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
      <SectionTitle iconName="swatch">
        <Trans id="controls.section.layout-options">Layout options</Trans>
      </SectionTitle>
      <ControlSectionContent gap="large">
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
            <Box mt={4}>
              <Typography variant="caption" component="p" sx={{ mb: 1 }}>
                <Trans id="controls.section.animation.duration">
                  Animation Duration
                </Trans>
              </Typography>
              <RadioGroup>
                {[10, 30, 60].map((d) => (
                  <ChartOptionRadioField
                    key={d}
                    label={`${d}s`}
                    field="animation"
                    path="duration"
                    value={d}
                  />
                ))}
              </RadioGroup>
            </Box>
            <Box mt={4}>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography variant="caption" component="p">
                  <Trans id="controls.section.animation.type">
                    Animation Type
                  </Trans>
                </Typography>
                <Tooltip
                  arrow
                  title={t({
                    id: "controls.section.animation.type.explanation",
                    message:
                      "Use the Stepped type to make the animation jump between data points at fixed intervals. This mode is useful when you want to animate data using a time dimension with a non-uniform distribution of dates.",
                  })}
                >
                  <Typography
                    sx={{ color: "primary.main", lineHeight: "0 !important" }}
                  >
                    <SvgIcInfoCircle width={16} height={16} />
                  </Typography>
                </Tooltip>
              </Box>
              <RadioGroup>
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
              </RadioGroup>
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
                <Typography
                  sx={{ color: "primary.main", lineHeight: "0 !important" }}
                >
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
    <Flex sx={{ flexDirection: "column", gap: 1 }}>
      <Typography variant="caption">
        <Trans id="controls.select.column.layout">Column layout</Trans>
      </Typography>
      <RadioGroup>
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
      </RadioGroup>
    </Flex>
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
      <SectionTitle iconName="normalize" warnMessage={warnMessage}>
        <Trans id="controls.select.calculation.mode">Chart mode</Trans>
      </SectionTitle>
      <ControlSectionContent>
        <RadioGroup>
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
        </RadioGroup>
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
        return t({ id: "controls.sorting.byDimensionLabel", message: "Name" });
      case "byMeasure":
        return t({ id: "controls.sorting.byMeasure", message: "Measure" });
      case "byTotalSize":
        return t({ id: "controls.sorting.byTotalSize", message: "Total size" });
      case "byAuto":
        return t({ id: "controls.sorting.byAuto", message: "Automatic" });
      default:
        const _exhaustiveCheck: never = type;
        return _exhaustiveCheck;
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
        type: "CHART_FIELD_UPDATED",
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
      <ControlSectionContent>
        <Select
          id="sort-by"
          size="sm"
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
        <RadioGroup>
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
        </RadioGroup>
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
