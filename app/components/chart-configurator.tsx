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
import { CollapsibleSection } from "./chart-controls";
import { ControlTabField, FilterTabField } from "./field";
import { Loading } from "./hint";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { DataCubeMetadata } from "../graphql/types";

export const ChartConfigurator = ({
  state
}: {
  state: ConfiguratorStateConfiguringChart;
}) => {
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: state.dataSet, locale }
  });

  if (data?.dataCubeByIri) {
    const mappedIris = getFieldComponentIris(state.chartConfig.fields);
    const unMappedDimensions = data?.dataCubeByIri.dimensions.filter(
      dim => !mappedIris.has(dim.iri)
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
                key={dimension.iri}
                component={dimension}
                value={dimension.iri}
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
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];

  return (
    <>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.segment?.componentIri
        )}
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
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.segment?.componentIri
        )}
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
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.segment?.componentIri
        )}
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
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.y.componentIri
        )}
        value={"y"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.x.componentIri
        )}
        value={"x"}
      ></ControlTabField>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.segment?.componentIri
        )}
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
  metaData: DataCubeMetadata;
}) => {
  const { dimensions, measures } = metaData;

  const components = [...dimensions, ...measures];
  return (
    <>
      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.value.componentIri
        )}
        value={"y"}
      ></ControlTabField>

      <ControlTabField
        component={components.find(
          d => d.iri === chartConfig.fields.segment?.componentIri
        )}
        value={"segment"}
      ></ControlTabField>
    </>
  );
};
