import { NextPage, GetStaticProps, GetStaticPaths } from "next";
import { ChartPublished } from "../../../components/chart-published";
import { Config } from "../../../configurator";
import { loadFixtureConfigIds, loadFixtureConfig } from "../../../test/utils";

type PageProps = {
  statusCode?: number;
  config?: {
    key: string;
    data: Config;
  };
  publishSuccess?: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const ids = await loadFixtureConfigIds();

  return {
    fallback: false,
    paths: ids.flatMap((chartId) => {
      return [
        { params: { locale: "en", chartId } },
        { params: { locale: "de", chartId } },
      ];
    }),
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const config = await loadFixtureConfig(params?.chartId?.toString() ?? "");

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
