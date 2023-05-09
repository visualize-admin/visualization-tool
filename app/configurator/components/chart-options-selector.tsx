import { t, Trans } from "@lingui/macro";
import { Box, Stack } from "@mui/material";
import get from "lodash/get";
import keyBy from "lodash/keyBy";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { DEFAULT_SORTING, getFieldComponentIri } from "@/charts";
import {
  chartConfigOptionsUISpec,
  EncodingFieldType,
  EncodingOption,
  EncodingSortingOption,
  EncodingSpec,
} from "@/charts/chart-config-ui-options";
import { getMap } from "@/charts/map/ref";
import { useImputationNeeded } from "@/charts/shared/chart-helpers";
import Flex from "@/components/flex";
import { FieldSetLegend, Radio, Select } from "@/components/form";
import {
  AnimationField,
  ChartConfig,
  ChartType,
  ColorFieldType,
  ColorScaleType,
  ComponentType,
  ConfiguratorStateConfiguringChart,
  ImputationType,
  imputationTypes,
  isAnimationInConfig,
  isAreaConfig,
  isConfiguring,
  isTableConfig,
  MapConfig,
  SortingType,
  useConfiguratorState,
} from "@/configurator";
import { ColorPalette } from "@/configurator/components/chart-controls/color-palette";
import {
  ControlSection,
  ControlSectionContent,
  ControlSectionSkeleton,
  SectionTitle,
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
  getIconName,
} from "@/configurator/components/ui-helpers";
import { GenericField } from "@/configurator/config-types";
import { TableColumnOptions } from "@/configurator/table/table-chart-options";
import {
  getDimensionsByDimensionType,
  isDimensionSortable,
  isStandardErrorDimension,
  isTemporalDimension,
} from "@/domain/data";
import {
  DimensionMetadataFragment,
  useComponentsWithHierarchiesQuery,
  useDataCubeMetadataQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { DataCubeMetadataWithHierarchies } from "@/graphql/types";
import { useLocale } from "@/locales/use-locale";

import { ColorRampField } from "./chart-controls/color-ramp";

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { activeField, chartConfig, dataSet, dataSource } = state;
  const locale = useLocale();
  const [{ data: metadataData }] = useDataCubeMetadataQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [{ data: componentsData }] = useComponentsWithHierarchiesQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });
  const [{ data: observationsData }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      filters: chartConfig.filters,
    },
  });

  const imputationNeeded = useImputationNeeded({
    chartConfig,
    data: observationsData?.dataCubeByIri?.observations.data,
  });

  const metaData = useMemo(() => {
    if (metadataData?.dataCubeByIri && componentsData?.dataCubeByIri) {
      return {
        ...metadataData.dataCubeByIri,
        measures: componentsData.dataCubeByIri.measures,
        dimensions: isTableConfig(chartConfig)
          ? componentsData.dataCubeByIri.dimensions
          : [
              // There are no fields that make use of numeric dimensions at the moment.
              ...componentsData.dataCubeByIri.dimensions.filter(
                (d) => !d.isNumerical
              ),
            ],
      };
    }
  }, [chartConfig, metadataData?.dataCubeByIri, componentsData?.dataCubeByIri]);

  if (metaData) {
    return (
      <Box
        sx={{
          // we need these overflow parameters to allow iOS scrolling
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {activeField ? (
          isTableConfig(chartConfig) ? (
            <TableColumnOptions state={state} metaData={metaData} />
          ) : (
            <ActiveFieldSwitch
              state={state}
              metaData={metaData}
              imputationNeeded={imputationNeeded}
            />
          )
        ) : null}
      </Box>
    );
  } else {
    return (
      <>
        <ControlSectionSkeleton />
        <ControlSectionSkeleton />
      </>
    );
  }
};

const ActiveFieldSwitch = ({
  state,
  metaData,
  imputationNeeded,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadataWithHierarchies;
  imputationNeeded: boolean;
}) => {
  const activeField = state.activeField as EncodingFieldType | undefined;

  if (!activeField) {
    return null;
  }

  const encodings =
    chartConfigOptionsUISpec[state.chartConfig.chartType].encodings;
  const encoding = encodings.find(
    (e) => e.field === activeField
  ) as EncodingSpec;

  const activeFieldComponentIri = getFieldComponentIri(
    state.chartConfig.fields,
    activeField
  );

  const allComponents = [...metaData.dimensions, ...metaData.measures];
  const component = allComponents.find(
    (d) => d.iri === activeFieldComponentIri
  );

  return (
    <EncodingOptionsPanel
      encoding={encoding}
      state={state}
      field={activeField} // FIXME: or encoding.field?
      chartType={state.chartConfig.chartType}
      component={component}
      dimensions={metaData.dimensions}
      measures={metaData.measures}
      imputationNeeded={imputationNeeded}
    />
  );
};

const EncodingOptionsPanel = ({
  encoding,
  state,
  field,
  chartType,
  component,
  dimensions,
  measures,
  imputationNeeded,
}: {
  encoding: EncodingSpec;
  state: ConfiguratorStateConfiguringChart;
  field: EncodingFieldType;
  chartType: ChartType;
  component: DimensionMetadataFragment | undefined;
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  imputationNeeded: boolean;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  const fieldLabelHint: Partial<Record<EncodingFieldType, string>> = {
    x: t({ id: "controls.select.dimension", message: "Select a dimension" }),
    y: t({ id: "controls.select.measure", message: "Select a measure" }),
    animation: t({
      id: "controls.select.dimension",
      message: "Select a dimension",
    }),
  };

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [field]);

  const { fields } = state.chartConfig;
  const otherFields = Object.keys(fields).filter(
    (f) => (fields as any)[f].hasOwnProperty("componentIri") && field !== f
  );
  const otherFieldsIris = otherFields.map(
    (f) => (fields as any)[f].componentIri
  );

  const options = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: encoding.componentTypes,
      dimensions,
      measures,
    }).map((dimension) => ({
      value: dimension.iri,
      label: dimension.label,
      disabled:
        ((encoding.exclusive === undefined || encoding.exclusive === true) &&
          otherFieldsIris.includes(dimension.iri)) ||
        isStandardErrorDimension(dimension),
    }));
  }, [
    dimensions,
    encoding.componentTypes,
    encoding.exclusive,
    measures,
    otherFieldsIris,
  ]);

  const allComponents = useMemo(() => {
    return [...measures, ...dimensions];
  }, [measures, dimensions]);

  const fieldDimension = useMemo(() => {
    const encodingIri = (
      (fields as any)?.[encoding.field] as GenericField | undefined
    )?.componentIri;

    return allComponents.find((d) => d.iri === encodingIri);
  }, [allComponents, fields, encoding.field]);

  const hasStandardError = useMemo(() => {
    return allComponents.find((d) =>
      d.related?.some(
        (r) => r.type === "StandardError" && r.iri === component?.iri
      )
    );
  }, [allComponents, component]);

  // TODO: Add proper types here.
  const optionsByField = useMemo(
    () => keyBy(encoding.options, (enc) => enc.field),
    [encoding]
  );

  return (
    <div
      key={`control-panel-${encoding.field}`}
      role="tabpanel"
      id={`control-panel-${encoding.field}`}
      aria-labelledby={`tab-${encoding.field}`}
      ref={panelRef}
      tabIndex={-1}
    >
      {/* Only show component select if necessary */}
      {encoding.componentTypes.length > 0 ? (
        <ControlSection>
          <SectionTitle iconName={getIconName(encoding.field)}>
            {getFieldLabel(encoding.field)}
          </SectionTitle>
          <ControlSectionContent gap="none">
            <ChartFieldField
              field={encoding.field}
              label={fieldLabelHint[encoding.field]}
              optional={encoding.optional}
              options={options}
            />
            {optionsByField["useAbbreviations"] && (
              <Box mt={3}>
                <ChartFieldAbbreviations
                  field={field}
                  dimension={fieldDimension}
                />
              </Box>
            )}
            {encoding.options && (
              <ChartFieldOptions
                disabled={!component}
                field={encoding.field}
                encodingOptions={encoding.options}
                chartType={chartType}
              />
            )}
            {optionsByField["color"]?.field === "color" &&
              optionsByField["color"].type === "palette" && (
                <ColorPalette
                  disabled={!component}
                  field={field}
                  component={component}
                />
              )}
          </ControlSectionContent>
        </ControlSection>
      ) : null}

      {/* FIXME: should be generic or shouldn't be a field at all */}
      {field === "baseLayer" ? (
        <ChartMapBaseLayerSettings state={state} />
      ) : null}

      {encoding.sorting && isDimensionSortable(component) && (
        <ChartFieldSorting
          state={state}
          field={field}
          encodingSortingOptions={encoding.sorting}
        />
      )}

      {optionsByField["size"]?.field === "size" && component && (
        <ChartFieldSize
          field={field}
          componentTypes={optionsByField["size"].componentTypes}
          dimensions={dimensions}
          measures={measures}
          optional={optionsByField["size"].optional}
        />
      )}

      {optionsByField["color"]?.field === "color" &&
        optionsByField["color"].type === "component" &&
        component && (
          <ChartFieldColorComponent
            state={state}
            chartConfig={state.chartConfig}
            field={encoding.field}
            component={component}
            componentTypes={optionsByField["color"].componentTypes}
            dimensions={dimensions}
            measures={measures}
            optional={optionsByField["color"].optional}
            enableUseAbbreviations={
              optionsByField["color"].enableUseAbbreviations
            }
          />
        )}

      {optionsByField["showStandardError"] && hasStandardError && (
        <ControlSection>
          <SectionTitle iconName="eye">
            <Trans id="controls.section.additional-information">
              Show additional information
            </Trans>
          </SectionTitle>
          <ControlSectionContent component="fieldset" gap="none">
            <ChartOptionCheckboxField
              path="showStandardError"
              field={encoding.field}
              defaultValue={true}
              label={t({ id: "controls.section.show-standard-error" })}
            />
          </ControlSectionContent>
        </ControlSection>
      )}

      {optionsByField["imputationType"] && isAreaConfig(state.chartConfig) && (
        <ChartImputationType state={state} disabled={!imputationNeeded} />
      )}

      <ChartFieldMultiFilter
        state={state}
        component={component}
        encoding={encoding}
        field={field}
        dimensions={dimensions}
        measures={measures}
      />

      {fieldDimension &&
        field === "animation" &&
        isAnimationInConfig(state.chartConfig) &&
        state.chartConfig.fields.animation && (
          <ChartFieldAnimation field={state.chartConfig.fields.animation} />
        )}
    </div>
  );
};

const ChartFieldAbbreviations = ({
  field,
  path,
  dimension,
}: {
  field: string;
  path?: string;
  dimension: DimensionMetadataFragment | undefined;
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

const ChartFieldAnimation = ({ field }: { field: AnimationField }) => {
  return (
    <ControlSection>
      <SectionTitle iconName="settings">
        <Trans id="controls.section.animation.settings">
          Animation Settings
        </Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset" gap="none">
        <ChartOptionSwitchField
          label={t({
            id: "controls.section.animation.show-play-button",
            message: "Show Play button",
          })}
          field="animation"
          path="showPlayButton"
        />
        {field.showPlayButton && (
          <Box component="fieldset" mt={4}>
            <FieldSetLegend
              legendTitle={
                <Trans id="controls.section.animation.duration">
                  Animation Duration
                </Trans>
              }
            />
            <Flex sx={{ justifyContent: "flex-start" }}>
              <ChartOptionRadioField
                label="30s"
                field="animation"
                path="duration"
                value={30}
              />
              <ChartOptionRadioField
                label="60s"
                field="animation"
                path="duration"
                value={60}
              />
            </Flex>
          </Box>
        )}
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldMultiFilter = ({
  state,
  component,
  encoding,
  field,
  dimensions,
  measures,
}: {
  state: ConfiguratorStateConfiguringChart;
  component: DimensionMetadataFragment | undefined;
  encoding: EncodingSpec;
  field: string;
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
}) => {
  const colorComponentIri = get(
    state.chartConfig,
    `fields.${field}.color.componentIri`
  );
  const colorComponent = [...dimensions, ...measures].find(
    (d) => d.iri === colorComponentIri
  );
  const colorType = get(state.chartConfig, `fields.${field}.color.type`) as
    | ColorFieldType
    | undefined;

  return encoding.filters && component ? (
    <ControlSection data-testid="chart-edition-multi-filters">
      <SectionTitle
        disabled={!component}
        iconName="filter"
        gutterBottom={false}
      >
        <Trans id="controls.section.filter">Filter</Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset" gap="none">
        <legend style={{ display: "none" }}>
          <Trans id="controls.section.filter">Filter</Trans>
        </legend>
        {isTemporalDimension(component) ? (
          <TimeFilter
            key={component.iri}
            dimensionIri={component.iri}
            dataSetIri={state.dataSet}
          />
        ) : (
          component && (
            <DimensionValuesMultiFilter
              key={component.iri}
              dimensionIri={component.iri}
              dataSetIri={state.dataSet}
              field={field}
              colorComponent={colorComponent || component}
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

const ChartFieldOptions = ({
  field,
  chartType,
  encodingOptions,
  disabled = false,
}: {
  field: string;
  chartType: ChartType;
  encodingOptions?: EncodingOption[];
  disabled?: boolean;
}) => {
  return (
    <>
      {encodingOptions?.map((e) => e.field).includes("chartSubType") &&
        chartType === "column" && (
          <Box component="fieldset" mt={4}>
            <FieldSetLegend
              legendTitle={
                <Trans id="controls.select.column.layout">Column layout</Trans>
              }
            />
            <Flex sx={{ justifyContent: "flex-start" }}>
              <ChartOptionRadioField
                label={getFieldLabel("stacked")}
                field={field}
                path="type"
                value={"stacked"}
                disabled={disabled}
              />
              <ChartOptionRadioField
                label={getFieldLabel("grouped")}
                field={field}
                path="type"
                value={"grouped"}
                disabled={disabled}
              />
            </Flex>
          </Box>
        )}
    </>
  );
};

const ChartFieldSorting = ({
  state,
  field,
  encodingSortingOptions,
  disabled = false,
}: {
  state: ConfiguratorStateConfiguringChart;
  field: string;
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
    state,
    ["chartConfig", "fields", field, "sorting", "sortingType"],
    DEFAULT_SORTING["sortingType"]
  );

  // FIXME: Remove this once it's properly encoded in chart-config-ui-options
  const sortingOrderOptions = encodingSortingOptions.find(
    (o) => o.sortingType === activeSortingType
  )?.sortingOrder;
  const activeSortingOrder = get(
    state,
    ["chartConfig", "fields", field, "sorting", "sortingOrder"],
    sortingOrderOptions?.[0] ?? "asc"
  );

  return (
    <ControlSection>
      <SectionTitle disabled={disabled} iconName="sort">
        <Trans id="controls.section.sorting">Sort</Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset">
        <Box>
          <Select
            id="sort-by"
            label={getFieldLabel("sortBy")}
            options={encodingSortingOptions
              ?.map((s) => s.sortingType)
              .map((opt) => ({
                value: opt,
                label: getSortingTypeLabel(opt),
              }))}
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
                state,
                ["chartConfig", "fields", "segment", "type"],
                ""
              );
              const chartSubType = `${state.chartConfig.chartType}.${subType}`;

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
  field: string;
  componentTypes: ComponentType[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  optional: boolean;
}) => {
  const measuresOptions = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: componentTypes,
      dimensions,
      measures,
    }).map(({ iri, label }) => ({ value: iri, label }));
  }, [dimensions, measures, componentTypes]);

  return (
    <ControlSection>
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
          path="measureIri"
          options={measuresOptions}
          isOptional={optional}
        />
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartFieldColorComponent = ({
  state,
  chartConfig,
  field,
  component,
  componentTypes,
  dimensions,
  measures,
  optional,
  enableUseAbbreviations,
}: {
  state: ConfiguratorStateConfiguringChart;
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  component: DimensionMetadataFragment;
  componentTypes: ComponentType[];
  dimensions: DimensionMetadataFragment[];
  measures: DimensionMetadataFragment[];
  optional: boolean;
  enableUseAbbreviations: boolean;
}) => {
  const nbOptions = component.values.length;
  const measuresOptions = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: componentTypes,
      dimensions,
      measures,
    }).map(({ iri, label }) => ({ value: iri, label }));
  }, [dimensions, measures, componentTypes]);
  const nbColorOptions = useMemo(() => {
    return Array.from(
      { length: Math.min(7, Math.max(0, nbOptions - 2)) },
      (_, i) => i + 3
    ).map((d) => ({ value: d, label: `${d}` }));
  }, [nbOptions]);

  const colorComponentIri = get(chartConfig, [
    "fields",
    field,
    "color",
    "componentIri",
  ]) as string | undefined;
  const colorComponent = [...dimensions, ...measures].find(
    (d) => d.iri === colorComponentIri
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
    <ControlSection>
      <SectionTitle iconName="color">
        {t({ id: "controls.color", message: "Color" })}
      </SectionTitle>
      <ControlSectionContent>
        <ChartOptionSelectField
          id="color-component"
          label={t({
            id: "controls.select.measure",
            message: "Select a measure",
          })}
          // FIXME: how to handle nested fields & options?
          field={field}
          path="color.componentIri"
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
              defaultValue={80}
            />
          </>
        ) : colorType === "categorical" ? (
          colorComponentIri && component.iri !== colorComponentIri ? (
            <DimensionValuesMultiFilter
              key={component.iri}
              dataSetIri={state.dataSet}
              dimensionIri={colorComponentIri}
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
              nbClass={nbClass}
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

const ChartImputationType = ({
  state,
  disabled,
}: {
  state: ConfiguratorStateConfiguringChart;
  disabled?: boolean;
}) => {
  const [, dispatch] = useConfiguratorState();

  const getImputationTypeLabel = (type: ImputationType) => {
    switch (type) {
      case "none":
        return t({ id: "controls.imputation.type.none", message: `-` });
      case "zeros":
        return t({
          id: "controls.imputation.type.zeros",
          message: `Zeros`,
        });
      case "linear":
        return t({
          id: "controls.imputation.type.linear",
          message: `Linear interpolation`,
        });
      default:
        return t({ id: "controls.imputation.type.none", message: `-` });
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

  if (disabled) {
    updateImputationType("none");
  }

  const activeImputationType: ImputationType = get(
    state,
    ["chartConfig", "fields", "y", "imputationType"],
    "none"
  );

  return (
    <ControlSection>
      <SectionTitle disabled={disabled} iconName="info">
        <Trans id="controls.section.imputation">Missing values</Trans>
      </SectionTitle>
      <ControlSectionContent component="fieldset" gap="none">
        {!disabled && (
          <Box mb={5}>
            <Trans id="controls.section.imputation.explanation">
              For this chart type, replacement values should be assigned to
              missing values. Decide on the imputation logic or switch to
              another chart type.
            </Trans>
          </Box>
        )}
        <Box mb={1}>
          <Select
            id="imputation-type"
            label={getFieldLabel("imputation")}
            options={imputationTypes.map((d) => ({
              value: d,
              label: getImputationTypeLabel(d),
            }))}
            value={activeImputationType}
            disabled={disabled}
            onChange={(e) => {
              updateImputationType(e.target.value as ImputationType);
            }}
          />
        </Box>
      </ControlSectionContent>
    </ControlSection>
  );
};

const ChartMapBaseLayerSettings = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const chartConfig = state.chartConfig as MapConfig;
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
            // FIXME: shouldn't be a field if not mapped
            // to a component
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
};
