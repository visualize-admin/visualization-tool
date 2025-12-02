import { Config as PrismaConfig } from "@prisma/client";
import "iframe-resizer/js/iframeResizer.contentWindow.js";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import Head from "next/head";
import "@open-iframe-resizer/core";

import { ChartPublished } from "@/components/chart-published";
import { useEmbedQueryParams } from "@/components/embed-params";
import {
  ConfiguratorStateProvider,
  ConfiguratorStatePublished,
} from "@/configurator";
import { getConfig, increaseConfigViewCount } from "@/db/config";
import { serializeProps } from "@/db/serialize";

type PageProps =
  | {
      status: "notfound";
    }
  | {
      status: "found";
      config: Omit<PrismaConfig, "data"> & {
        data: Omit<ConfiguratorStatePublished, "activeField" | "state">;
      };
    };

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (config?.data) {
    await increaseConfigViewCount(config.key);
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
  const { embedParams } = useEmbedQueryParams();

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const {
    config: { key, data: state },
  } = props;

  return (
    <>
      <Head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self' 'unsafe-inline' data:; script-src 'unsafe-inline' 'unsafe-eval' 'self' https://api.mapbox.com https://api.maptiler.com; style-src 'self' 'unsafe-inline';"
        />
      </Head>
      <ConfiguratorStateProvider
        chartId="published"
        initialState={{ ...state, state: "PUBLISHED" }}
      >
        <ChartPublished configKey={key} embedParams={embedParams} />
      </ConfiguratorStateProvider>
    </>
  );
};

export default EmbedPage;
