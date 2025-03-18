import { Config as PrismaConfig } from "@prisma/client";
import "iframe-resizer/js/iframeResizer.contentWindow.js";
import { GetServerSideProps } from "next";
import ErrorPage from "next/error";
import { useRouter } from "next/router";

import { ChartPublished } from "@/components/chart-published";
import {
  ConfiguratorStateProvider,
  ConfiguratorStatePublished,
} from "@/configurator";
import { getConfig, increaseConfigViewCount } from "@/db/config";
import { serializeProps } from "@/db/serialize";
import { useEmbedQueryParams } from "@/components/embed-params";

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
  const { query } = useRouter();
  const {
    embedParams: { removeBorder },
  } = useEmbedQueryParams(query);

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const {
    config: { key, data: state },
  } = props;

  return (
    <ConfiguratorStateProvider
      chartId="published"
      initialState={{ ...state, state: "PUBLISHED" }}
    >
      <ChartPublished configKey={key} removeBorder={removeBorder} />
    </ConfiguratorStateProvider>
  );
};

export default EmbedPage;
