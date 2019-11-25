import React from "react";
import {
  ColumnConfig,
  ConfiguratorStateConfiguringChart,
  LineConfig,
  AreaConfig,
  ScatterPlotConfig,
  FieldType
} from "../domain";
import { DataSetMetadata, useDataSetAndMetadata } from "../domain/data-cube";
import { CollapsibleSection } from "./chart-controls";
import { ControlTabField, FilterTabField } from "./field";
import { Loading } from "./hint";
import { Trans } from "@lingui/macro";

const ColumnChartFields = ({
  chartConfig,
  metaData
}: {
  chartConfig: ColumnConfig;
  metaData: DataSetMetadata;
}) => {
  const { componentsByIri } = metaData;

  return (
    <>
      <ControlTabField
        iconName={"y"}
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        iconName={"x"}
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        iconName={"segment"}
        component={
          chartConfig.fields.segment
            ? componentsByIri[chartConfig.fields.segment.componentIri]
            : undefined
        }
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const LineChartFields = ({
  chartConfig,
  metaData
}: {
  chartConfig: LineConfig;
  metaData: DataSetMetadata;
}) => {
  const { componentsByIri } = metaData;

  return (
    <>
      <ControlTabField
        iconName={"y"}
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        iconName={"x"}
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        iconName={"segment"}
        component={
          chartConfig.fields.segment
            ? componentsByIri[chartConfig.fields.segment.componentIri]
            : undefined
        }
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const AreaChartFields = ({
  chartConfig,
  metaData
}: {
  chartConfig: AreaConfig;
  metaData: DataSetMetadata;
}) => {
  const { componentsByIri } = metaData;

  return (
    <>
      <ControlTabField
        iconName={"y"}
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        iconName={"x"}
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        iconName={"segment"}
        component={
          chartConfig.fields.segment
            ? componentsByIri[chartConfig.fields.segment.componentIri]
            : undefined
        }
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const ScatterPlotChartFields = ({
  chartConfig,
  metaData
}: {
  chartConfig: ScatterPlotConfig;
  metaData: DataSetMetadata;
}) => {
  const { componentsByIri } = metaData;

  return (
    <>
      <ControlTabField
        iconName={"y"}
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        iconName={"x"}
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        iconName={"segment"}
        component={
          chartConfig.fields.segment
            ? componentsByIri[chartConfig.fields.segment.componentIri]
            : undefined
        }
        value={"segment"}
      ></ControlTabField>
    </>
  );
};

export const ChartConfigurator = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const meta = useDataSetAndMetadata(state.dataSet);

  if (meta.data) {
    const mappedIris = new Set(
      Object.values<FieldType>(state.chartConfig.fields).map(
        f => f.componentIri
      )
    );
    const unMappedDimensions = meta.data.dimensions.filter(
      dim => !mappedIris.has(dim.component.iri.value)
    );
    return (
      <>
        <CollapsibleSection title={<Trans>Design</Trans>}>
          {state.chartConfig.chartType === "column" ? (
            <ColumnChartFields
              chartConfig={state.chartConfig}
              metaData={meta.data}
            />
          ) : state.chartConfig.chartType === "line" ? (
            <LineChartFields
              chartConfig={state.chartConfig}
              metaData={meta.data}
            />
          ) : state.chartConfig.chartType === "area" ? (
            <AreaChartFields
              chartConfig={state.chartConfig}
              metaData={meta.data}
            />
          ) : state.chartConfig.chartType === "scatterplot" ? (
            <ScatterPlotChartFields
              chartConfig={state.chartConfig}
              metaData={meta.data}
            />
          ) : null}
        </CollapsibleSection>
        <CollapsibleSection title={<Trans>Data</Trans>}>
          {unMappedDimensions.map((dimension, i) => (
            <FilterTabField
              key={dimension.component.iri.value}
              component={dimension}
              value={dimension.component.iri.value as $FixMe}
            ></FilterTabField>
          ))}
        </CollapsibleSection>
      </>
    );
  } else {
    return <Loading />;
  }
};
