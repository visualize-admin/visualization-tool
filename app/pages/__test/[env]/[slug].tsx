import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { ChartPublished } from "@/components/chart-published";
import {
  ChartConfig,
  ConfiguratorStateProvider,
  DataSource,
  Meta,
} from "@/configurator";
import { migrateConfiguratorState } from "@/utils/chart-config/versioning";
import { EmbedOptionsProvider } from "@/utils/embed";

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
    const run = async () => {
      const importedConfig = (
        await import(`../../../test/__fixtures/config/${env}/${slug}`)
      ).default;
      setConfig({
        ...importedConfig,
        data: migrateConfiguratorState(importedConfig.data, {
          migrationProps: { key: importedConfig.key },
        }),
      });
    };

    run();
  }, [env, slug]);

  if (config) {
    return (
      <EmbedOptionsProvider>
        <ConfiguratorStateProvider
          chartId="published"
          initialState={{ ...config.data, state: "PUBLISHED" }}
        >
          <ChartPublished />
        </ConfiguratorStateProvider>
      </EmbedOptionsProvider>
    );
  }
  return null;
};

export default Page;
