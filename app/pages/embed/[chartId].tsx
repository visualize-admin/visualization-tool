import "iframe-resizer/js/iframeResizer.contentWindow.js";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";

import { ChartPublished } from "@/components/chart-published";
import { Config } from "@/configurator";
import { getConfig } from "@/db/config";
import { serializeProps } from "@/db/serialize";
import { EmbedOptionsProvider } from "@/utils/embed";

type PageProps =
  | {
      status: "notfound";
    }
  | {
      status: "found";
      config: {
        key: string;
        data: Omit<Config, "activeField">;
      };
    };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (config && config.data) {
    // TODO validate configuration
    return { props: serializeProps({ status: "found", config }) };
  }

  res.statusCode = 404;

  return { props: { status: "notfound" } };
};

const EmbedPage = (props: PageProps) => {
  if (props.status === "notfound") {
    // TODO: display 404 message
    return <ErrorPage statusCode={404} />;
  }

  const {
    config: {
      key,
      data: { dataSet, dataSource, meta, chartConfig },
    },
  } = props;

  return (
    <EmbedOptionsProvider>
      <ChartPublished
        dataSet={dataSet}
        dataSource={dataSource}
        chartConfig={chartConfig}
        meta={meta}
        configKey={key}
      />
    </EmbedOptionsProvider>
  );
};

export default EmbedPage;
