import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import { ChartConfig, DataSource, Meta } from "@/configurator";
import { migrateChartConfig } from "@/utils/chart-config/versioning";
import { EmbedOptionsProvider } from "@/utils/embed";

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
        await import(`../../../test/__fixtures/config/${env}/${slug}`)
      ).default;
      setConfig(importedConfig);
    };
    run();
  }, [env, slug]);

  if (config) {
    const { dataSet, dataSource, meta, chartConfig } = config.data;
    const migratedConfig = migrateChartConfig(chartConfig, {
      migrationProps: config.data,
    });

    return (
      <EmbedOptionsProvider>
        <ChartPublished
          dataSet={dataSet}
          dataSource={dataSource}
          chartConfig={migratedConfig}
          meta={meta}
          configKey={config.key}
        />
      </EmbedOptionsProvider>
    );
  }
  return null;
};

export default Page;
