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
import {
  EmbedQueryParam,
  LegacyEmbedQueryParam,
} from "@/components/publish-actions";

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

  if (props.status === "notfound") {
    return <ErrorPage statusCode={404} />;
  }

  const {
    config: { key, data: state },
  } = props;

  const { disableBorder, removeBorder } = query as unknown as Record<
    EmbedQueryParam | LegacyEmbedQueryParam,
    boolean
  >;

  return (
    <ConfiguratorStateProvider
      chartId="published"
      initialState={{ ...state, state: "PUBLISHED" }}
    >
      <ChartPublished
        configKey={key}
        removeBorder={!!disableBorder || !!removeBorder}
      />
    </ConfiguratorStateProvider>
  );
};

export default EmbedPage;
