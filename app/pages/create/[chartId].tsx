import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import { useMemo } from "react";

import { AppLayout } from "@/components/layout";
import {
  createMetadataPanelStore,
  MetadataPanelStoreContext,
} from "@/components/metadata-panel-store";
import { Configurator, ConfiguratorStateProvider } from "@/configurator";
import { AddNewDatasetPanel } from "@/configurator/components/add-new-dataset-panel";

type PageProps = {
  locale: string;
  chartId: string;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
  locale,
}) => {
  return {
    props: {
      locale: locale!,
      chartId: params!.chartId as string,
    },
  };
};

const ChartConfiguratorPage: NextPage<PageProps> = ({ chartId }) => {
  const metadataPanelStore = useMemo(() => {
    return createMetadataPanelStore();
  }, []);

  return (
    <>
      <Head>
        {/* Disables responsive scaling for this page (other pages still work) */}
        <meta name="viewport" content="width=1280"></meta>
      </Head>
      <AppLayout>
        <ConfiguratorStateProvider chartId={chartId}>
          <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
            <Configurator />
            <AddNewDatasetPanel />
          </MetadataPanelStoreContext.Provider>
        </ConfiguratorStateProvider>
      </AppLayout>
    </>
  );
};

export default ChartConfiguratorPage;
