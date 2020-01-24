import { Trans } from "@lingui/macro";
import React from "react";
import { Box } from "@theme-ui/components";
import {
  AreaConfig,
  ColumnConfig,
  ConfiguratorStateConfiguringChart,
  LineConfig,
  ScatterPlotConfig,
  getFieldComponentIris,
  PieConfig
} from "../domain";
import { DataSetMetadata, useDataSetAndMetadata } from "../domain/data-cube";
import { CollapsibleSection } from "./chart-controls";
import { ControlTabField, FilterTabField } from "./field";
import { Loading } from "./hint";

export const ChartConfigurator = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const meta = useDataSetAndMetadata(state.dataSet);

  if (meta.data) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const unMappedDimensions = meta.data.dimensions.filter(
      dim => !mappedIris.has(dim.component.iri.value)
    );
    return (
      <>
        {/* CollapsibleSection is not really needed here, but let's keep it
      in case we need them later */}
        <CollapsibleSection
          titleId="controls-design"
          title={<Trans id="controls.section.design">Design</Trans>}
        >
          <Box
            role="tablist"
            aria-labelledby="controls-design"
            variant="leftControlSectionContent"
          >
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
            ) : state.chartConfig.chartType === "pie" ? (
              <PieChartFields
                chartConfig={state.chartConfig}
                metaData={meta.data}
              />
            ) : null}
          </Box>
        </CollapsibleSection>
        <CollapsibleSection
          titleId="controls-data"
          title={<Trans id="controls.section.data">Data</Trans>}
        >
          <Box
            role="tablist"
            aria-labelledby="controls-data"
            variant="leftControlSectionContent"
          >
            {unMappedDimensions.map((dimension, i) => (
              <FilterTabField
                key={dimension.component.iri.value}
                component={dimension}
                value={dimension.component.iri.value as $FixMe}
              ></FilterTabField>
            ))}
          </Box>
        </CollapsibleSection>
      </>
    );
  } else {
    return <Loading />;
  }
};

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
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
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
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
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
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
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
        component={componentsByIri[chartConfig.fields.y.componentIri]}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={componentsByIri[chartConfig.fields.x.componentIri]}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
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
const PieChartFields = ({
  chartConfig,
  metaData
}: {
  chartConfig: PieConfig;
  metaData: DataSetMetadata;
}) => {
  const { componentsByIri } = metaData;

  return (
    <>
      <ControlTabField
        component={componentsByIri[chartConfig.fields.value.componentIri]}
        value={"value"}
      ></ControlTabField>
      <ControlTabField
        component={componentsByIri[chartConfig.fields.segment.componentIri]}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
