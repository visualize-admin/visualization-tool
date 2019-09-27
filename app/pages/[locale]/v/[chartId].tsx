import "isomorphic-unfetch";
import { NextPage } from "next";
import ErrorPage from "next/error";
import { ChartAreasVisualization } from "../../../components/cockpit-chart-areas";
import { ChartBarsVisualization } from "../../../components/cockpit-chart-bars";
import { ChartLinesVisualization } from "../../../components/cockpit-chart-lines";
import { useDataSetAndMetadata, DataCubeProvider } from "../../../domain";
import { ChartConfig } from "../../../domain/config-types";

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
      {chartConfig.chartType === "bar" && (
        <ChartBarsVisualization
          dataset={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          filters={chartConfig.filters}
          xField={chartConfig.x}
          groupByField={chartConfig.color}
          heightField={chartConfig.height}
        />
      )}
      {chartConfig.chartType === "line" && (
        <ChartLinesVisualization
          dataset={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          filters={chartConfig.filters}
          xField={chartConfig.x}
          groupByField={chartConfig.color}
          heightField={chartConfig.height}
        />
      )}
      {chartConfig.chartType === "area" && (
        <ChartAreasVisualization
          dataset={rd.data.dataSet}
          dimensions={rd.data.dimensions}
          measures={rd.data.measures}
          filters={chartConfig.filters}
          xField={chartConfig.x}
          groupByField={chartConfig.color}
          heightField={chartConfig.height}
        />
      )}
    </div>
  ) : null;
};

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: any;
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
      <DataCubeProvider
        endpoint="https://trifid-lindas.test.cluster.ldbar.ch/query"
        // endpoint="https://ld.stadt-zuerich.ch/query"
      >
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
