import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import get from "lodash/get";
import { ReactNode, useCallback, useMemo } from "react";

import { getFieldComponentId } from "@/charts";
import {
  ANIMATION_FIELD_SPEC,
  EncodingFieldType,
  EncodingSpec,
  getChartSpec,
} from "@/charts/chart-config-ui-options";
import { useQueryFilters } from "@/charts/shared/chart-helpers";
import Flex from "@/components/flex";
import { Select, SelectOption } from "@/components/form";
import { InfoIconTooltip } from "@/components/info-icon-tooltip";
import {
  ChartConfig,
  ConfiguratorStateConfiguringChart,
  GenericField,
  ImputationType,
  imputationTypes,
  isAnimationInConfig,
  isComboChartConfig,
  isMapConfig,
  isTableConfig,
  MapConfig,
  RegularChartConfig,
} from "@/config-types";
import { getChartConfig } from "@/config-utils";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
} from "@/configurator/components/chart-controls/section";
import { Abbreviations } from "@/configurator/components/chart-options-selector/abbreviations";
import { AnimationField } from "@/configurator/components/chart-options-selector/animation-field";
import { BaseLayerField } from "@/configurator/components/chart-options-selector/base-layer-field";
import { CalculationField } from "@/configurator/components/chart-options-selector/calculation-field";
import { ColorComponentField } from "@/configurator/components/chart-options-selector/color-component-field";
import { ComboYField } from "@/configurator/components/chart-options-selector/combo-y-field";
import { ConversionUnitsField } from "@/configurator/components/chart-options-selector/conversion-units-field";
import { LayoutField } from "@/configurator/components/chart-options-selector/layout-field";
import { LimitsField } from "@/configurator/components/chart-options-selector/limits-field";
import { MultiFilterField } from "@/configurator/components/chart-options-selector/multi-filter-field";
import { ScaleDomain } from "@/configurator/components/chart-options-selector/scale-domain";
import { ShowDotsField } from "@/configurator/components/chart-options-selector/show-dots-field";
import { SizeField } from "@/configurator/components/chart-options-selector/size-field";
import { SortingField } from "@/configurator/components/chart-options-selector/sorting-field";
import { makeGetFieldOptionGroups } from "@/configurator/components/chart-options-selector/utils";
import { CustomLayersSelector } from "@/configurator/components/custom-layers-selector";
import {
  ChartFieldField,
  ChartOptionCheckboxField,
  ChartOptionSwitchField,
} from "@/configurator/components/field";
import { getFieldLabel } from "@/configurator/components/field-i18n";
import { getComponentLabel } from "@/configurator/components/ui-helpers";
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
  Measure,
  Observation,
} from "@/domain/data";
import { useFlag } from "@/flags";
import {
  useDataCubesComponentsQuery,
  useDataCubesMetadataQuery,
  useDataCubesObservationsQuery,
} from "@/graphql/hooks";
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
  const hasSubType = !!encoding.options?.chartSubType;

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
              <Abbreviations field={field} component={fieldComponent} />
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
      {fieldComponent && (hasSubType || hasColorPalette) && (
        <LayoutField
          encoding={encoding}
          component={component}
          // Combo charts use their own drawer.
          chartConfig={chartConfig as RegularChartConfig}
          components={components}
          hasColorPalette={hasColorPalette}
          hasSubType={hasSubType}
          measures={measures}
        />
      )}
      {encoding.options?.imputation?.shouldShow(chartConfig, observations) && (
        <ChartImputation chartConfig={chartConfig} />
      )}
      {encoding.options?.calculation && get(fields, "segment") && (
        <CalculationField
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
          <SortingField
            chartConfig={chartConfig}
            field={field}
            encodingSortingOptions={encoding.sorting}
          />
        )}
      {encoding.options?.size && component && (
        <SizeField
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
        <ColorComponentField
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
      <MultiFilterField
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
          <AnimationField field={chartConfig.fields.animation} />
        )}
    </div>
  );
};

const SwitchWrapper = ({ children }: { children: ReactNode }) => {
  return <Flex sx={{ alignItems: "center", gap: 1 }}>{children}</Flex>;
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
