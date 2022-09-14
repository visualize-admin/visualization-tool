import { t, Trans } from "@lingui/macro";
import { Box } from "@mui/material";
import get from "lodash/get";
import keyBy from "lodash/keyBy";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { getFieldComponentIri } from "@/charts";
import {
  chartConfigOptionsUISpec,
  EncodingOptions,
  EncodingSortingOption,
  EncodingSpec,
} from "@/charts/chart-config-ui-options";
import { useImputationNeeded } from "@/charts/shared/chart-helpers";
import Flex from "@/components/flex";
import { FieldSetLegend, Radio, Select } from "@/components/form";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  ImputationType,
  imputationTypes,
  isAreaConfig,
  isMapConfig,
  isTableConfig,
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
import { EmptyRightPanel } from "@/configurator/components/empty-right-panel";
import {
  ChartFieldField,
  ChartOptionCheckboxField,
  ChartOptionRadioField,
} from "@/configurator/components/field";
import {
  DimensionValuesMultiFilter,
  TimeFilter,
} from "@/configurator/components/filters";
import {
  getFieldLabel,
  getIconName,
} from "@/configurator/components/ui-helpers";
import { MapColumnOptions } from "@/configurator/map/map-chart-options";
import { TableColumnOptions } from "@/configurator/table/table-chart-options";
import {
  getDimensionsByDimensionType,
  isStandardErrorDimension,
} from "@/domain/data";
import {
  DimensionMetadataFragment,
  useDataCubeObservationsQuery,
} from "@/graphql/query-hooks";
import { DataCubeMetadata } from "@/graphql/types";
import { useLocale } from "@/locales/use-locale";

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeObservationsQuery({
    variables: {
      iri: state.dataSet,
      sourceType: state.dataSource.type,
      sourceUrl: state.dataSource.url,
      locale,
      dimensions: null,
      filters: state.chartConfig.filters,
    },
  });

  const imputationNeeded = useImputationNeeded({
    chartConfig: state.chartConfig,
    data: data?.dataCubeByIri?.observations.data,
  });

  if (data?.dataCubeByIri) {
    const meta = {
      ...data.dataCubeByIri,
      dimensions: [
        // There are no fields that make use of numeric dimensions at the moment.
        ...data.dataCubeByIri.dimensions.filter((d) => !d.isNumerical),
      ],
    };

    return (
      <Box
        sx={{
          // we need these overflow parameters to allow iOS scrolling
          overflowX: "hidden",
          overflowY: "auto",
        }}
      >
        {state.activeField ? (
          isTableConfig(state.chartConfig) ? (
            <TableColumnOptions state={state} metaData={meta} />
          ) : isMapConfig(state.chartConfig) ? (
            <MapColumnOptions state={state} metaData={meta} />
          ) : (
            <ActiveFieldSwitch
              state={state}
              metaData={meta}
              imputationNeeded={imputationNeeded}
            />
          )
        ) : (
          <EmptyRightPanel state={state} />
        )}
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

  const getFieldLabelHint = {
    x: t({ id: "controls.select.dimension", message: "Select a dimension" }),
    y: t({ id: "controls.select.measure", message: "Select a measure" }),
    // FIXME: encoding types, so we don't need these there (chart options are
    // handled in a separate file)
    baseLayer: "",
    areaLayer: "",
    symbolLayer: "",
    segment: "",
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
      dimensionTypes: encoding.values,
      dimensions,
      measures,
    }).map((dimension) => ({
      value: dimension.iri,
      label: dimension.label,
      disabled:
        otherFieldsIris.includes(dimension.iri) ||
        isStandardErrorDimension(dimension),
    }));
  }, [dimensions, encoding.values, measures, otherFieldsIris]);

  const hasStandardError = useMemo(() => {
    return [...measures, ...dimensions].find((m) =>
      m.related?.some(
        (r) => r.type === "StandardError" && r.iri === component?.iri
      )
    );
  }, [dimensions, measures, component]);

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
      <ControlSection>
        <SectionTitle iconName={getIconName(encoding.field)}>
          {getFieldLabel(encoding.field)}
        </SectionTitle>
        <ControlSectionContent gap="none">
          <ChartFieldField
            field={encoding.field}
            label={getFieldLabelHint[encoding.field]}
            optional={encoding.optional}
            options={options}
            dataSetMetadata={metaData}
          />
          {encoding.options && (
            <ChartFieldOptions
              disabled={!component}
              field={encoding.field}
              encodingOptions={encoding.options}
              chartType={chartType}
            />
          )}
          {optionsByField["color"] && (
            <ColorPalette
              disabled={!component}
              field={field}
              component={component}
            />
          )}
        </ControlSectionContent>
      </ControlSection>
      {/* Only nominal dimensions are sortable!
          Temporal and Ordinal dimensions already have a defined order. */}
      {encoding.sorting && component?.__typename === "NominalDimension" && (
        <ChartFieldSorting
          state={state}
          disabled={!component}
          field={encoding.field}
          encodingSortingOptions={encoding.sorting}
          // chartType={chartType}
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
      {encoding.filters && component && (
        <ControlSection data-testid="chart-edition-right-filters">
          <SectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SectionTitle>
          <ControlSectionContent component="fieldset" gap="none">
            <legend style={{ display: "none" }}>
              <Trans id="controls.section.filter">Filter</Trans>
            </legend>
            {component && component.__typename === "TemporalDimension" ? (
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
                />
              )
            )}
          </ControlSectionContent>
        </ControlSection>
      )}
    </div>
  );
};

const ChartFieldOptions = ({
  field,
  chartType,
  encodingOptions,
  disabled = false,
}: {
  field: string;
  chartType: ChartType;
  encodingOptions: EncodingOptions;
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
  const [, dispatch] = useConfiguratorState();

  const getSortingTypeLabel = (type: SortingType) => {
    switch (type) {
      case "byDimensionLabel":
        return t({ id: "controls.sorting.byDimensionLabel", message: `Name` });
      case "byMeasure":
        return t({ id: "controls.sorting.byMeasure", message: `Measure` });
      case "byTotalSize":
        return t({ id: "controls.sorting.byTotalSize", message: `Total size` });
      default:
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
          field,
          path: "sorting",
          value: { sortingType, sortingOrder },
        },
      });
    },
    [dispatch, field]
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
      <ControlSectionContent component="fieldset" gap="none">
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
