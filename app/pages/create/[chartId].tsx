import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import * as React from "react";

import { AppLayout } from "@/components/layout";
import { Configurator, EditorConfiguratorStateProvider } from "@/configurator";

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
  return (
    <>
      <Head>
        {/* Disables responsive scaling for this page (other pages still work) */}
        <meta name="viewport" content="width=1280"></meta>
      </Head>
      <AppLayout>
        <EditorConfiguratorStateProvider chartId={chartId}>
          <Configurator />
        </EditorConfiguratorStateProvider>
      </AppLayout>
    </>
  );
};

export default ChartConfiguratorPage;
