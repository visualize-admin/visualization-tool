import "iframe-resizer/js/iframeResizer.contentWindow.js";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { ChartPublished } from "../../../components/chart-published";
import { fetchConfig } from "../../../config-api";
import { Config } from "../../../domain/config-types";

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
  const config = await fetchConfig(query.chartId as string);

  if (config && config.data) {
    // TODO validate configuration
    return { props: { status: "found", config } };
  }

  res.statusCode = 404;

  return { props: { status: "notfound" } };
};

export default (props: PageProps) => {
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
