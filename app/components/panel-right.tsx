import React from "react";
import { Heading, Text } from "rebass";
import {
  ColumnFields,
  ConfiguratorStateConfiguringChart,
  DataSetMetadata,
  useDataSetAndMetadata,
  ChartFieldKey,
  DimensionWithMeta,
  MeasureWithMeta
} from "../domain";
import { ControlList, CollapsibleSection } from "./chart-controls";
import { Field } from "./field";
import {
  DimensionValuesMultiFilter,
  DimensionValuesSingleFilter
} from "./filters";
import { Loading } from "./hint";

export const PanelRight = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const meta = useDataSetAndMetadata(state.dataSet);

  if (meta.data) {
    return (
      <CollapsibleSection>
        <Heading as="h2">
          <Text variant="table">{state.activeField}</Text>
        </Heading>
        <ControlList>
          <ActiveFieldSwitch state={state} metaData={meta.data} />
        </ControlList>
      </CollapsibleSection>
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
  // TODO: what to do with optional fields?
  const activeFieldComponent: { componentIri: string } | undefined =
    state.chartConfig.fields[state.activeField];

  // It's a dimension which is not mapped to a field, so we show the filter!
  if (!activeFieldComponent) {
    return <Filter state={state} metaData={metaData} />;
  }
  const component = metaData.componentsByIri[activeFieldComponent.componentIri];

  const componentType = component.component.componentType;

  return componentType === "measure" ? (
    <MeasurePanel field={state.activeField} metaData={metaData} />
  ) : (
    <DimensionPanel
      field={state.activeField}
      metaData={metaData}
      dimension={component as DimensionWithMeta}
    />
  );
};

const DimensionPanel = ({
  field,
  dimension,
  metaData
}: {
  field: ChartFieldKey;
  dimension: DimensionWithMeta;
  metaData: DataSetMetadata;
}) => {
  const { dimensions } = metaData;

  return (
    <>
      <Field
        type="select"
        path={`fields.${field}.componentIri`}
        label={"Dimension wählen"}
        options={dimensions.map(({ component }) => ({
          value: component.iri.value,
          label: component.labels[0].value
        }))}
      />
      <CollapsibleSection>
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
  field: ChartFieldKey;
  metaData: DataSetMetadata;
}) => {
  const { measures } = metaData;

  return (
    <>
      {measures.map(({ component }) => (
        <Field
          key={component.iri.value}
          type="radio"
          path={`fields.${field}.componentIri`}
          label={component.labels[0].value}
          value={component.iri.value}
        />
      ))}
    </>
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
  return (
    <>
      {state.activeField && ( // FIXME: Dont' check here if the filter panel is active
        <DimensionValuesSingleFilter
          dimension={
            dimensions.find(
              dim => dim.component.iri.value === state.activeField
            )!
          }
        ></DimensionValuesSingleFilter>
      )}
    </>
  );
};
