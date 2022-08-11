import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import { ChartConfig, DataSource, Meta } from "@/configurator";

type DbConfig = {
  dataSet: string;
  dataSource: DataSource;
  chartConfig: ChartConfig;
  meta: Meta;
};

const Page: NextPage = () => {
  const router = useRouter();
  const { env, slug } = router.query;
  const [config, setConfig] = useState<{ key: string; data: DbConfig }>();

  useEffect(() => {
    const run = async () => {
      const importedConfig = (
        await import(`../../../test/__fixtures/${env}/${slug}`)
      ).default;
      setConfig(importedConfig);
    };
    run();
  }, [env, slug]);

  if (config) {
    const { dataSet, dataSource, meta, chartConfig } = config.data;

    return (
      <ChartPublished
        dataSet={dataSet}
        dataSource={dataSource}
        chartConfig={chartConfig}
        meta={meta}
        configKey={config.key}
      />
    );
  }
  return null;
};

export default Page;
