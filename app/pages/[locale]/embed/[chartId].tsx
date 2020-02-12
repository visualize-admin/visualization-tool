import "iframe-resizer/js/iframeResizer.contentWindow.js";
import "isomorphic-unfetch";
import { NextPage } from "next";
import ErrorPage from "next/error";
import { ChartPublished } from "../../../components/chart-published";
import { Config } from "../../../domain/config-types";
import { GraphqlProvider } from "../../../graphql/context";

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: Config;
  };
  publishSuccess?: string;
};

const Page: NextPage<PageProps> = ({ config, statusCode, publishSuccess }) => {
  if (statusCode) {
    // TODO: display 404 message
    return <ErrorPage statusCode={statusCode} />;
  }

  if (config) {
    const { dataSet, meta, chartConfig } = config.data;

    return (
      <GraphqlProvider>
        <ChartPublished
          dataSet={dataSet}
          chartConfig={chartConfig}
          meta={meta}
        />
      </GraphqlProvider>
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
  const publishSuccess = query.publishSuccess as string;
  if (config && config.data) {
    // TODO validate configuration
    return { config, publishSuccess };
  }

  if (res) {
    res.statusCode = 404;
  }

  return { statusCode: 404 };
};

export default Page;
