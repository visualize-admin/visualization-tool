import { Trans } from "@lingui/macro";
import React from "react";
import {
  AreaConfig,
  ColumnConfig,
  ConfiguratorStateConfiguringChart,
  LineConfig,
  ScatterPlotConfig,
  getFieldComponentIris,
  PieConfig,
} from "../domain";
import {
  ControlSection,
  SectionTitle,
  ControlSectionContent,
} from "./chart-controls/section";
import { ControlTabField, FilterTabField } from "./field";
import { Loading } from "./hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { DataCubeMetadata } from "../graphql/types";

export const ChartConfigurator = ({
  state,
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale },
  });

  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const unMappedDimensions = data?.dataCubeByIri.dimensions.filter(
      (dim) => !mappedIris.has(dim.iri)
    );
    return (
      <>
        <ControlSection>
          <SectionTitle>
            <Trans id="controls.section.design">Design</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-design"
          >
            {state.chartConfig.chartType === "column" ? (
              <ColumnChartFields
                chartConfig={state.chartConfig}
                metaData={data.dataCubeByIri}
              />
            ) : state.chartConfig.chartType === "line" ? (
              <LineChartFields
                chartConfig={state.chartConfig}
                metaData={data.dataCubeByIri}
              />
            ) : state.chartConfig.chartType === "area" ? (
              <AreaChartFields
                chartConfig={state.chartConfig}
                metaData={data.dataCubeByIri}
              />
            ) : state.chartConfig.chartType === "scatterplot" ? (
              <ScatterPlotChartFields
                chartConfig={state.chartConfig}
                metaData={data.dataCubeByIri}
              />
            ) : state.chartConfig.chartType === "pie" ? (
              <PieChartFields
                chartConfig={state.chartConfig}
                metaData={data.dataCubeByIri}
              />
            ) : null}
          </ControlSectionContent>
        </ControlSection>
        <ControlSection>
          <SectionTitle>
            <Trans id="controls.section.data">Data</Trans>
          </SectionTitle>
          <ControlSectionContent
            side="left"
            role="tablist"
            aria-labelledby="controls-data"
          >
            {unMappedDimensions.map((dimension, i) => (
              <FilterTabField
                key={dimension.iri}
                component={dimension}
                value={dimension.iri}
              ></FilterTabField>
            ))}
          </ControlSectionContent>
        </ControlSection>
      </>
    );
  } else {
    return <Loading />;
  }
};

const ColumnChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: ColumnConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];

  return (
    <>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.segment?.componentIri
        )}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const LineChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: LineConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.segment?.componentIri
        )}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const AreaChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: AreaConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.segment?.componentIri
        )}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const ScatterPlotChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: ScatterPlotConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.segment?.componentIri
        )}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
const PieChartFields = ({
  chartConfig,
  metaData,
}: {
  chartConfig: PieConfig;
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>

      <ControlTabField
        component={components.find(
          (d) => d.iri === chartConfig.fields.segment?.componentIri
        )}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
