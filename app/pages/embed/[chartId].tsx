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
          content={[
            `default-src 'self' 'unsafe-inline' data: https://*.sentry.io https://vercel.live/ https://vercel.com https://*.googletagmanager.com`,
            `script-src 'unsafe-inline' 'unsafe-eval' 'self' https://api.mapbox.com https://api.maptiler.com https://*.sentry.io https://vercel.live/ https://vercel.com https://*.googletagmanager.com`,
            `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net`,
            `font-src 'self'`,
            `form-action 'self'`,
            `connect-src 'self' *`,
            `img-src 'self' * data: blob:`,
            `script-src-elem 'self' 'unsafe-inline' https://*.admin.ch https://visualize.admin.ch https://*.visualize.admin.ch https://vercel.live https://vercel.com https://*.vercel.app https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://api.mapbox.com https://cdn.jsdelivr.net`,
            `worker-src 'self' blob: https://*.admin.ch https://*.vercel.app`,
          ].join("; ")}
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
