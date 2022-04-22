import { NextPage, GetStaticProps, GetStaticPaths } from "next";

import { ChartPublished } from "@/components/chart-published";
import { Config } from "@/configurator";
import {
  findFixtureConfig,
  loadFixtureConfig,
  loadFixtureConfigs,
} from "@/test/utils";

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: Config;
  };
  publishSuccess?: string;
};

export const getStaticPaths: GetStaticPaths = async ({ locales }) => {
  const ids = await loadFixtureConfigs();

  return {
    fallback: false,
    paths: ids.flatMap(({ slug, env }) => {
      return (
        locales?.map((locale) => ({ params: { env, slug }, locale })) ?? []
      );
    }),
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const findOptions = {
    env: params?.env?.toString() ?? "",
    slug: params?.slug?.toString() ?? "",
  };
  const testConfig = await findFixtureConfig(findOptions);
  if (!testConfig) {
    throw new Error(`Could not find testConfig ${JSON.stringify(findOptions)}`);
  }
  const config = await loadFixtureConfig(testConfig);
  return {
    props: { config },
  };
};

const Page: NextPage<PageProps> = ({ config, statusCode, publishSuccess }) => {
  if (config) {
    const { dataSet, meta, chartConfig } = config.data;

    return (
      <ChartPublished
        dataSet={dataSet}
        chartConfig={chartConfig}
        meta={meta}
        configKey={config.key}
      />
    );
  }

  // Should never happen
  return null;
};

export default Page;
