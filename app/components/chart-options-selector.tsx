import React from "react";
import {
  ConfiguratorStateConfiguringChart,
  DataSetMetadata,
  DimensionWithMeta,
  useDataSetAndMetadata,
  ChartType
} from "../domain";
import {
  CollapsibleSection,
  ControlList,
  ColorPalette
} from "./chart-controls";
import { ChartFieldField, ChartOptionField } from "./field";
import {
  DimensionValuesMultiFilter,
  DimensionValuesSingleFilter
} from "./filters";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";

export const ChartOptionsSelector = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const meta = useDataSetAndMetadata(state.dataSet);

  if (meta.data) {
    return <ActiveFieldSwitch state={state} metaData={meta.data} />;
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

  return (
    <>
      <CollapsibleSection title={field}>
        <ChartFieldField
          field={field}
          label={<Trans>Select a dimension</Trans>}
          options={dimensions.map(({ component }) => ({
            value: component.iri.value,
            label: component.label.value
          }))}
          dataSetMetadata={metaData}
        />
        {field === "segment" && (
          <ChartFieldOptions field={field} chartType={chartType} />
        )}
      </CollapsibleSection>
      <CollapsibleSection title={<Trans>Filter</Trans>}>
        <ControlList>
          <DimensionValuesMultiFilter dimension={dimension} />
        </ControlList>
      </CollapsibleSection>
    </>
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

  return (
    <CollapsibleSection title={field}>
      <ChartFieldField
        field={field}
        label={<Trans>Select a measure</Trans>}
        options={measures.map(({ component }) => ({
          value: component.iri.value,
          label: component.label.value
        }))}
        dataSetMetadata={metaData}
      />
    </CollapsibleSection>
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
  return (
    <CollapsibleSection title={<Trans>Filter</Trans>}>
      {activeDimension && (
        <DimensionValuesSingleFilter
          dimension={activeDimension}
        ></DimensionValuesSingleFilter>
      )}
    </CollapsibleSection>
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
        <>
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
        </>
      )}
      <ColorPalette field={field}></ColorPalette>
    </>
  );
};
