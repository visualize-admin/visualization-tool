import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import * as React from "react";

import { AppLayout } from "@/components/layout";
import {
  createMetadataPanelStore,
  MetadataPanelStoreContext,
} from "@/components/metadata-panel";
import { Configurator, EditorConfiguratorStateProvider } from "@/configurator";
import { getConfig } from "@/db/config";

type PageProps = {
  locale: string;
  chartId: string;
};

export const getServerSideProps: GetServerSideProps<PageProps | {}> = async ({
  params,
  locale,
  query,
  res,
}) => {
  const config = await getConfig(query.chartId as string);

  if (!config) {
    res.statusCode = 404;
    return { props: { chartId: undefined } };
  }

  if (!config.is_draft) {
    return {
      props: {},
      redirect: {
        destination: `/v/${query.chartId}`,
      },
    };
  }

  return {
    props: {
      locale: locale!,
      chartId: params!.chartId as string,
    },
  };
};

const ChartConfiguratorPage: NextPage<PageProps> = ({ chartId }) => {
  const metadataPanelStore = React.useMemo(
    () => createMetadataPanelStore(),
    []
  );

  return (
    <>
      <Head>
        {/* Disables responsive scaling for this page (other pages still work) */}
        <meta name="viewport" content="width=1280"></meta>
      </Head>
      <AppLayout>
        <EditorConfiguratorStateProvider chartId={chartId}>
          <MetadataPanelStoreContext.Provider value={metadataPanelStore}>
            <Configurator />
          </MetadataPanelStoreContext.Provider>
        </EditorConfiguratorStateProvider>
      </AppLayout>
    </>
  );
};

export default ChartConfiguratorPage;
