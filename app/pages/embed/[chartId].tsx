import "iframe-resizer/js/iframeResizer.contentWindow.js";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { ChartPublished } from "@/components/chart-published";
import { getConfig } from "@/db/config";
import { Config } from "@/configurator";

type PageProps =
  | {
      status: "notfound";
    }
  | {
      status: "found";
      config: {
        key: string;
        data: Config;
      };
    };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (config && config.data) {
    // TODO validate configuration
    return { props: { status: "found", config } };
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
      data: { dataSet, meta, chartConfig },
    },
  } = props;

  return (
    <ChartPublished
      dataSet={dataSet}
      chartConfig={chartConfig}
      meta={meta}
      configKey={key}
    />
  );
};

export default EmbedPage;
