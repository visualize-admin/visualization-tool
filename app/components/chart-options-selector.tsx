import { Trans } from "@lingui/macro";
import React, { useEffect, useRef } from "react";
import { Box, Flex } from "rebass";
import {
  ChartType,
  ConfiguratorStateConfiguringChart,
  DataSetMetadata,
  DimensionWithMeta,
  useDataSetAndMetadata
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

export const ChartOptionsSelector = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const meta = useDataSetAndMetadata(state.dataSet);

  if (meta.data) {
    return (
      <Box
        sx={{
          // we need these overflow parameters to allow iOS scrolling
          overflowX: "hidden",
          overflowY: "scroll",
          mb: 7
        }}
      >
        <ActiveFieldSwitch state={state} metaData={meta.data} />
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
  metaData: DataSetMetadata;
}) => {
  const { activeField } = state;

  if (!activeField) {
    return null;
  }
  // TODO: what to do with optional fields?
  const activeFieldComponent: { componentIri: string } | undefined =
    state.chartConfig.fields[activeField];

  // It's a dimension which is not mapped to a field, so we show the filter!
  if (!activeFieldComponent) {
    return <Filter state={state} metaData={metaData} />;
  }

  const component = metaData.componentsByIri[activeFieldComponent.componentIri];

  const componentType = component.component.componentType;

  return componentType === "measure" ? (
    <MeasurePanel field={activeField} metaData={metaData} />
  ) : (
    <DimensionPanel
      field={activeField}
      chartType={state.chartConfig.chartType}
      metaData={metaData}
      dimension={component as DimensionWithMeta}
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
  dimension: DimensionWithMeta;
  metaData: DataSetMetadata;
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
          options={dimensions.map(({ component }) => ({
            value: component.iri.value,
            label: component.label.value
          }))}
          dataSetMetadata={metaData}
        />
        {field === "segment" && (
          <ChartFieldOptions field={field} chartType={chartType} />
        )}
      </Box>

      <Box variant="controlSection">
        <SectionTitle iconName="filter">
          <Trans id="controls.section.filter">Filter</Trans>
        </SectionTitle>
        <Box variant="rightControlSectionContent" as="fieldset">
          <legend style={{ display: "none" }}>
            <Trans id="controls.section.filter">Filter</Trans>
          </legend>
          <DimensionValuesMultiFilter dimension={dimension} />
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
  metaData: DataSetMetadata;
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
          options={measures.map(({ component }) => ({
            value: component.iri.value,
            label: component.label.value
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
  metaData: DataSetMetadata;
}) => {
  const { dimensions } = metaData;
  const activeDimension = dimensions.find(
    dim => dim.component.iri.value === state.activeField
  );
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (panelRef && panelRef.current) {
      panelRef.current.focus();
    }
  }, [state.activeField]);
  return (
    <Box
      variant="controlSection"
      role="tabpanel"
      id={`filter-panel-${state.activeField}`}
      aria-labelledby={`tab-${state.activeField}`}
      ref={panelRef}
      tabIndex={-1}
    >
      <SectionTitle iconName="table">
        {activeDimension && activeDimension.component.label.value}
      </SectionTitle>
      <Box variant="rightControlSectionContent" as="fieldset">
        <legend style={{ display: "none" }}>
          {activeDimension && activeDimension.component.label.value}
        </legend>
        {activeDimension && (
          <DimensionValuesSingleFilter
            dimension={activeDimension}
          ></DimensionValuesSingleFilter>
        )}
      </Box>
    </Box>
  );
};

const ChartFieldOptions = ({
  field,
  chartType
}: {
  field: string;
  chartType: ChartType;
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
          <Flex justifyContent="flex-start" mt={1}>
            <ChartOptionField
              label="stacked"
              field={field}
              path="type"
              value={"stacked"}
            />
            <ChartOptionField
              label="grouped"
              field={field}
              path="type"
              value={"grouped"}
            />
          </Flex>
        </Box>
      )}
      <ColorPalette field={field}></ColorPalette>
    </>
  );
};
