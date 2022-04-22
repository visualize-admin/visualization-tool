import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import { ChartConfig, Meta } from "@/configurator";

type DbConfig = {
  dataSet: string;
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
  return null;
};

export default Page;
