import "isomorphic-unfetch";
import { NextPage } from "next";
import ErrorPage from "next/error";
import { useDataSetAndMetadata, DataCubeProvider } from "../../../domain";
import { ChartConfig, Config } from "../../../domain/config-types";
import { ChartColumnsVisualization } from "../../../components/chart-columns";
import { ChartLinesVisualization } from "../../../components/chart-lines";
import { ChartAreasVisualization } from "../../../components/chart-areas";
import { ChartScatterplotVisualization } from "../../../components/chart-scatterplot";

const DisplayChart = ({
  dataSet,
  chartConfig
}: {
  dataSet: string;
  chartConfig: ChartConfig;
}) => {
  // const datasets = useDataSets();
  const rd = useDataSetAndMetadata(dataSet);

  return rd.state === "loaded" ? (
    <div>
      {chartConfig.chartType === "column" && (
        <ChartColumnsVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
      {chartConfig.chartType === "scatterplot" && (
        <ChartScatterplotVisualization
          dataSet={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          chartConfig={chartConfig}
        />
      )}
    </div>
  ) : null;
};

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: Config;
  };
};

const Page: NextPage<PageProps> = ({ config, statusCode }) => {
  if (statusCode) {
    // TODO: display 404 message
    return <ErrorPage statusCode={statusCode} />;
  }

  if (config) {
    const { dataSet, chartConfig } = config.data;

    console.log(config.data);

    return (
      <DataCubeProvider>
        <DisplayChart dataSet={dataSet} chartConfig={chartConfig} />
      </DataCubeProvider>
    );
  }

  // Should never happen
  return null;
};

Page.getInitialProps = async ({ req, query, res }) => {
  const uri = res
    ? `http://localhost:${process.env.PORT || 3000}/api/config/${query.chartId}`
    : `/api/config/${query.chartId}`;
  const config = await fetch(uri).then(result => result.json());

  if (config && config.data) {
    // TODO validate configuration
    return { config };
  }

  if (res) {
    res.statusCode = 404;
  }

  return { statusCode: 404 };
};

export default Page;
