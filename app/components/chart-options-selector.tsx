import { Trans } from "@lingui/macro";
import React, { useEffect, useRef } from "react";
import { Box, Flex } from "@theme-ui/components";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  getFieldComponentIri
} from "../domain";
import { getFieldLabel } from "../domain/helpers";
import { IconName } from "../icons";
import { ColorPalette, SectionTitle } from "./chart-controls";
import { ChartFieldField, ChartOptionField } from "./field";
import {
  DimensionValuesMultiFilter,
  DimensionValuesSingleFilter
} from "./filters";
import { FieldSetLegend } from "./form";
import { Loading } from "./hint";
import { EmptyRightPanel } from "./empty-right-panel";
import { useLocale } from "../lib/use-locale";
import {
  useDataCubeMetadataWithComponentsQuery,
  DimensionFieldsWithValuesFragment
} from "../graphql/query-hooks";
import { DataCubeMetadata } from "../graphql/types";

export const ChartOptionsSelector = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentsQuery({
    variables: { iri: state.dataSet, locale }
  });

  if (data?.dataCubeByIri) {
    const meta = data.dataCubeByIri;

    return (
      <Box
        sx={{
          // we need these overflow parameters to allow iOS scrolling
          overflowX: "hidden",
          overflowY: "scroll",
          mb: 7
        }}
      >
        {state.activeField ? (
          <ActiveFieldSwitch state={state} metaData={meta} />
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
  metaData
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { activeField } = state;

  if (!activeField) {
    return null;
  }
  // TODO: what to do with optional fields?
  const activeFieldComponentIri = getFieldComponentIri(
    state.chartConfig.fields,
    activeField
  );
  // state.chartConfig.fields[activeField];

  // It's an optional field
  if (!activeFieldComponentIri && activeField === "segment") {
    return (
      <DimensionPanel
        field={activeField}
        chartType={state.chartConfig.chartType}
        metaData={metaData}
        dimension={undefined}
      />
    );
  }

  // It's a dimension which is not mapped to a field, so we show the filter!
  if (!activeFieldComponentIri) {
    return <Filter state={state} metaData={metaData} />;
  }

  const component = [...metaData.dimensions, ...metaData.measures].find(
    d => d.iri === activeFieldComponentIri
  );

  return component?.__typename === "Measure" ? (
    <MeasurePanel field={activeField} metaData={metaData} />
  ) : (
    <DimensionPanel
      field={activeField}
      chartType={state.chartConfig.chartType}
      metaData={metaData}
      dimension={component}
    />
  );
};

const DimensionPanel = ({
  field,
  chartType,
  dimension,
  metaData
}: {
  field: string;
  chartType: ChartType;
  dimension: { iri: string; label: string } | undefined;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions } = metaData;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [field]);

  return (
    <Box
      key={`control-panel-${field}`}
      variant="controlSection"
      role="tabpanel"
      id={`control-panel-${field}`}
      aria-labelledby={`tab-${field}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <SectionTitle iconName={field as IconName}>
        {getFieldLabel(field)}
      </SectionTitle>
      <Box variant="rightControlSectionContent">
        <ChartFieldField
          field={field}
          label={
            <Trans id="controls.select.dimension">Select a dimension</Trans>
          }
          optional={field === "segment"} // FIXME: Should be a more robust optional tag
          options={dimensions.map(dimension => ({
            value: dimension.iri,
            label: dimension.label
          }))}
          dataSetMetadata={metaData}
        />
        {field === "segment" && (
          <ChartFieldOptions
            disabled={!dimension}
            field={field}
            chartType={chartType}
          />
        )}
      </Box>

      <Box variant="controlSection">
        <SectionTitle disabled={!dimension} iconName="filter">
          <Trans id="controls.section.filter">Filter</Trans>
        </SectionTitle>
        <Box variant="rightControlSectionContent" as="fieldset">
          <legend style={{ display: "none" }}>
            <Trans id="controls.section.filter">Filter</Trans>
          </legend>
          {dimension && (
            <DimensionValuesMultiFilter
              key={dimension.iri}
              dimensionIri={dimension.iri}
              dataSetIri={metaData.iri}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
};

const MeasurePanel = ({
  field,
  metaData
}: {
  field: string;
  metaData: DataCubeMetadata;
}) => {
  const { measures } = metaData;
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [field]);
  return (
    <Box
      key={`control-panel-${field}`}
      variant="controlSection"
      role="tabpanel"
      id={`control-panel-${field}`}
      aria-labelledby={`tab-${field}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <SectionTitle iconName="y">{getFieldLabel(field)}</SectionTitle>
      <Box variant="rightControlSectionContent">
        <ChartFieldField
          field={field}
          label={<Trans id="controls.select.measure">Select a measure</Trans>}
          options={measures.map(measure => ({
            value: measure.iri,
            label: measure.label
          }))}
          dataSetMetadata={metaData}
        />
      </Box>
    </Box>
  );
};

const Filter = ({
  state,
  metaData
}: {
  state: ConfiguratorStateConfiguringChart;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions } = metaData;
  const activeDimension = dimensions.find(dim => dim.iri === state.activeField);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [state.activeField]);
  return (
    <Box
      key={`filter-panel-${state.activeField}`}
      variant="controlSection"
      role="tabpanel"
      id={`filter-panel-${state.activeField}`}
      aria-labelledby={`tab-${state.activeField}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <SectionTitle iconName="table">
        {activeDimension && activeDimension.label}
      </SectionTitle>
      <Box variant="rightControlSectionContent" as="fieldset">
        <legend style={{ display: "none" }}>
          {activeDimension && activeDimension.label}
        </legend>
        {activeDimension && (
          <DimensionValuesSingleFilter
            dataSetIri={metaData.iri}
            dimensionIri={activeDimension.iri}
          />
        )}
      </Box>
    </Box>
  );
};

const ChartFieldOptions = ({
  field,
  chartType,
  disabled = false
}: {
  field: string;
  chartType: ChartType;
  disabled?: boolean;
}) => {
  return (
    <>
      {chartType === "column" && (
        <Box as="fieldset" mt={2}>
          <FieldSetLegend
            legendTitle={
              <Trans id="controls.select.column.chart.type">Chart Type</Trans>
            }
          />
          <Flex sx={{ justifyContent: "flex-start" }} mt={1}>
            <ChartOptionField
              label="stacked"
              field={field}
              path="type"
              value={"stacked"}
              disabled={disabled}
            />
            <ChartOptionField
              label="grouped"
              field={field}
              path="type"
              value={"grouped"}
              disabled={disabled}
            />
          </Flex>
        </Box>
      )}
      <ColorPalette disabled={disabled} field={field}></ColorPalette>
    </>
  );
};
