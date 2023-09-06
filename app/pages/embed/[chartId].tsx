import "iframe-resizer/js/iframeResizer.contentWindow.js";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";

import { ChartPublished } from "@/components/chart-published";
import { Config, ConfiguratorStateProvider } from "@/configurator";
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

  if (config?.data) {
    return {
      props: serializeProps({
        status: "found",
        config,
      }),
    };
  }

  res.statusCode = 404;

  return {
    props: {
      status: "notfound",
    },
  };
};

const EmbedPage = (props: PageProps) => {
  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const {
    config: { key, data },
  } = props;

  return (
    <EmbedOptionsProvider>
      <ConfiguratorStateProvider
        chartId="published"
        initialState={{ ...data, state: "PUBLISHED" }}
      >
        <ChartPublished configKey={key} />
      </ConfiguratorStateProvider>
    </EmbedOptionsProvider>
  );
};

export default EmbedPage;
