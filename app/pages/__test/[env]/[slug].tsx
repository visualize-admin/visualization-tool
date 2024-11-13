import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import {
  ChartConfig,
  ConfiguratorStateProvider,
  ConfiguratorStatePublished,
  DataSource,
  Meta,
} from "@/configurator";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";

// FIXME: keep this in sync with configurator types.
type DbConfig = {
  key: string;
  version: string;
  dataSet: string;
  dataSource: DataSource;
  meta: Meta;
  chartConfigs: ChartConfig[];
  activeChartKey: string;
};

const Page: NextPage = () => {
  const router = useRouter();
  const { env, slug } = router.query;
  const [config, setConfig] = useState<{ key: string; data: DbConfig }>();

  useEffect(() => {
    if (!env || !slug) return;

    const run = async () => {
      const importedConfig = (
        await import(`../../../test/__fixtures/config/${env}/${slug}`)
      ).default;
      setConfig({
        ...importedConfig,
        data: await migrateConfiguratorState(importedConfig.data),
      });
    };

    run();
  }, [env, slug]);

  if (config) {
    return (
      <ConfiguratorStateProvider
        chartId="published"
        initialState={
          {
          ...config.data,
          state: "PUBLISHED",
          } as unknown as ConfiguratorStatePublished
        }
      >
        <ChartPublished />
      </ConfiguratorStateProvider>
    );
  }
  return null;
};

export default Page;
