import { t, Trans } from "@lingui/macro";
import { Box, Stack } from "@mui/material";
import get from "lodash/get";
import keyBy from "lodash/keyBy";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { getFieldComponentIri } from "@/charts";
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
  ChartConfig,
  ChartType,
  ColorFieldType,
  ColorScaleType,
  ComponentType,
  ConfiguratorStateConfiguringChart,
  ImputationType,
  imputationTypes,
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
  useDataCubeMetadataWithComponentValuesQuery,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { useLocale } from "@/locales/use-locale";

import { ColorRampField } from "./chart-controls/color-ramp";

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const { activeField, chartConfig, dataSet, dataSource } = state;
  const locale = useLocale();
  const [{ data: observationsData }] = useDataCubeObservationsQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
      filters: chartConfig.filters,
    },
  });

  // Unfiltered dimensions & measures values.
  const [{ data: metadataData }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: {
      iri: dataSet,
      sourceType: dataSource.type,
      sourceUrl: dataSource.url,
      locale,
    },
  });

  const imputationNeeded = useImputationNeeded({
    chartConfig,
    data: observationsData?.dataCubeByIri?.observations.data,
  });

  const metaData = useMemo(() => {
    if (metadataData?.dataCubeByIri) {
      return {
        ...metadataData.dataCubeByIri,
        dimensions: isTableConfig(chartConfig)
          ? metadataData.dataCubeByIri.dimensions
          : [
              // There are no fields that make use of numeric dimensions at the moment.
              ...metadataData.dataCubeByIri.dimensions.filter(
                (d) => !d.isNumerical
              ),
            ],
      };
    }
  }, [chartConfig, metadataData?.dataCubeByIri]);

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
  metaData: DataCubeMetadata;
  imputationNeeded: boolean;
}) => {
  const { activeField } = state;

  const encodings =
    chartConfigOptionsUISpec[state.chartConfig.chartType].encodings;
  const encoding = encodings.find(
    (e) => e.field === activeField
  ) as EncodingSpec;

  if (!activeField) {
    return null;
  }

  const activeFieldComponentIri = getFieldComponentIri(
    state.chartConfig.fields,
    activeField
  );

  const allDimensions = [...metaData.dimensions, ...metaData.measures];
  const component = allDimensions.find(
    (d) => d.iri === activeFieldComponentIri
  );

  return (
    <EncodingOptionsPanel
      encoding={encoding}
      state={state}
      field={activeField} // FIXME: or encoding.field?
      chartType={state.chartConfig.chartType}
      metaData={metaData}
      component={component}
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
  metaData,
  imputationNeeded,
}: {
  encoding: EncodingSpec;
  state: ConfiguratorStateConfiguringChart;
  field: string;
  chartType: ChartType;
  component: DimensionMetadataFragment | undefined;
  metaData: DataCubeMetadata;
  imputationNeeded: boolean;
}) => {
  const { measures, dimensions } = metaData;
  const panelRef = useRef<HTMLDivElement>(null);

  const fieldLabelHint: Partial<Record<EncodingFieldType, string>> = {
    x: t({ id: "controls.select.dimension", message: "Select a dimension" }),
    y: t({ id: "controls.select.measure", message: "Select a measure" }),
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

  const allDimensions = useMemo(() => {
    return [...measures, ...dimensions];
  }, [measures, dimensions]);

  const fieldDimension = useMemo(() => {
    const encodingIri = (
      (fields as any)?.[encoding.field] as GenericField | undefined
    )?.componentIri;

    return allDimensions.find((d) => d.iri === encodingIri);
  }, [allDimensions, fields, encoding.field]);

  const hasStandardError = useMemo(() => {
    return allDimensions.find((d) =>
      d.related?.some(
        (r) => r.type === "StandardError" && r.iri === component?.iri
      )
    );
  }, [allDimensions, component]);

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
          dataSetMetadata={metaData}
          optional={optionsByField["size"].optional}
        />
      )}

      {optionsByField["color"]?.field === "color" &&
        optionsByField["color"].type === "component" &&
        component && (
          <ChartFieldColorComponent
            chartConfig={state.chartConfig}
            field={encoding.field}
            component={component}
            componentTypes={optionsByField["color"].componentTypes}
            dataSetMetadata={metaData}
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
        metaData={metaData}
      />
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

const ChartFieldMultiFilter = ({
  state,
  component,
  encoding,
  field,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  component: DimensionMetadataFragment | undefined;
  encoding: EncodingSpec;
  field: string;
  metaData: DataCubeMetadata;
}) => {
  const colorComponentIri = get(
    state.chartConfig,
    `fields.${field}.color.componentIri`
  );
  const colorComponent = [...metaData.dimensions, ...metaData.measures].find(
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
            dataSetIri={metaData.iri}
          />
        ) : (
          component && (
            <DimensionValuesMultiFilter
              key={component.iri}
              dimensionIri={component.iri}
              dataSetIri={metaData.iri}
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
              sx={{ mb: 1 }}
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

  const getSortingTypeLabel = (type: SortingType) => {
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
        return t({ id: "controls.sorting.byDimensionLabel", message: `Name` });
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
    "byDimensionLabel"
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
  dataSetMetadata,
  optional,
}: {
  field: string;
  componentTypes: ComponentType[];
  dataSetMetadata: DataCubeMetadata;
  optional: boolean;
}) => {
  const measuresOptions = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: componentTypes,
      dimensions: dataSetMetadata.dimensions,
      measures: dataSetMetadata.measures,
    }).map(({ iri, label }) => ({ value: iri, label }));
  }, [dataSetMetadata.dimensions, dataSetMetadata.measures, componentTypes]);

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
  chartConfig,
  field,
  component,
  componentTypes,
  dataSetMetadata,
  optional,
  enableUseAbbreviations,
}: {
  chartConfig: ChartConfig;
  field: EncodingFieldType;
  component: DimensionMetadataFragment;
  componentTypes: ComponentType[];
  dataSetMetadata: DataCubeMetadata;
  optional: boolean;
  enableUseAbbreviations: boolean;
}) => {
  const nbOptions = component.values.length;
  const measuresOptions = useMemo(() => {
    return getDimensionsByDimensionType({
      dimensionTypes: componentTypes,
      dimensions: dataSetMetadata.dimensions,
      measures: dataSetMetadata.measures,
    }).map(({ iri, label }) => ({ value: iri, label }));
  }, [dataSetMetadata.dimensions, dataSetMetadata.measures, componentTypes]);
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
  const colorComponent = [
    ...dataSetMetadata.dimensions,
    ...dataSetMetadata.measures,
  ].find((d) => d.iri === colorComponentIri);
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
              dataSetIri={dataSetMetadata.iri}
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
              sx={{ mb: 1 }}
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
