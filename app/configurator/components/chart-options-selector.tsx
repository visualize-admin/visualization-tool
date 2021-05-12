import { t, Trans } from "@lingui/macro";
import get from "lodash/get";
import { useCallback, useEffect, useRef } from "react";
import { Box, Flex } from "theme-ui";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  SortingType,
  useConfiguratorState,
} from "..";
import { getFieldComponentIri } from "../../charts";
import {
  chartConfigOptionsUISpec,
  EncodingOptions,
  EncodingSortingOption,
  EncodingSpec,
} from "../../charts/chart-config-ui-options";
import { FieldSetLegend, Radio, Select } from "../../components/form";
import { Loading } from "../../components/hint";
import { getDimensionsByDimensionType } from "../../domain/data";
import {
  DimensionFieldsWithValuesFragment,
  useDataCubeMetadataWithComponentValuesQuery,
} from "../../graphql/query-hooks";
import { DataCubeMetadata } from "../../graphql/types";
import { useLocale } from "../../locales/use-locale";
import { TableColumnOptions } from "../table/table-chart-options";
import { ColorPalette } from "./chart-controls/color-palette";
import {
  ControlSection,
  ControlSectionContent,
  SectionTitle,
} from "./chart-controls/section";
import { EmptyRightPanel } from "./empty-right-panel";
import { ChartFieldField, ChartOptionRadioField } from "./field";
import { DimensionValuesMultiFilter, TimeFilter } from "./filters";
import { getFieldLabel, getIconName } from "./ui-helpers";

export const ChartOptionsSelector = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const meta = data.dataCubeByIri;

    return (
      <Box
        sx={{
          // we need these overflow parameters to allow iOS scrolling
          overflowX: "hidden",
          overflowY: "auto",
          mb: 7,
        }}
      >
        {state.activeField ? (
          state.chartConfig.chartType === "table" ? (
            <TableColumnOptions state={state} metaData={meta} />
          ) : (
            <ActiveFieldSwitch state={state} metaData={meta} />
          )
        ) : (
          <EmptyRightPanel state={state} />
        )}
      </Box>
    );
  } else {
    return <Loading />;
  }
};

const ActiveFieldSwitch = ({
  state,
  metaData,
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
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

  const component = [...metaData.dimensions].find(
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
}: {
  encoding: EncodingSpec;
  state: ConfiguratorStateConfiguringChart;
  field: string;
  chartType: ChartType;
  component: DimensionFieldsWithValuesFragment | undefined;
  metaData: DataCubeMetadata;
}) => {
  const { measures, dimensions } = metaData;
  const panelRef = useRef<HTMLDivElement>(null);

  const getFieldLabelHint = {
    x: t({ id: "controls.select.dimension", message: "Select a dimension" }),
    y: t({ id: "controls.select.measure", message: "Select a measure" }),
    segment: t({
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

  type AnyField = "y";
  const otherFields = Object.keys(fields).filter(
    (f) => fields[f as AnyField].hasOwnProperty("componentIri") && field !== f
  );
  const otherFieldsIris = otherFields.map(
    (f) => fields[f as AnyField].componentIri
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
        <ControlSectionContent side="right">
          <ChartFieldField
            field={encoding.field}
            label={getFieldLabelHint[encoding.field]}
            optional={encoding.optional}
            options={getDimensionsByDimensionType({
              dimensionTypes: encoding.values,
              dimensions,
              measures,
            }).map((dimension) => ({
              value: dimension.iri,
              label: dimension.label,
              disabled: otherFieldsIris.includes(dimension.iri),
            }))}
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
          {encoding.options?.map((e) => e.field).includes("color") && (
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
      {encoding.filters && (
        <ControlSection>
          <SectionTitle disabled={!component} iconName="filter">
            <Trans id="controls.section.filter">Filter</Trans>
          </SectionTitle>
          <ControlSectionContent side="right" as="fieldset">
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
          <Box as="fieldset" mt={2}>
            <FieldSetLegend
              legendTitle={
                <Trans id="controls.select.column.layout">Column layout</Trans>
              }
            />
            <Flex sx={{ justifyContent: "flex-start" }} mt={1}>
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
      <ControlSectionContent side="right" as="fieldset">
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
                sortingType: e.currentTarget
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
