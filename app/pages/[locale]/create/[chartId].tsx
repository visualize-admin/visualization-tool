import { GetServerSideProps, NextPage } from "next";
import Head from "next/head";
import React from "react";
import { ChartEditor } from "../../../components/editor/chart-editor";
import { AppLayout } from "../../../components/layout";
import { ConfiguratorStateProvider } from "../../../configurator";

type PageProps = {
  locale: string;
  chartId: string;
};

export const getServerSideProps: GetServerSideProps<PageProps> = async ({
  params,
}) => {
  return {
    props: {
      locale: params!.locale as string,
      chartId: params!.chartId as string,
    },
  };
};

const ChartConfiguratorPage: NextPage<PageProps> = ({ chartId }) => {
  return (
    <>
      <Head>
        {/* Disables resoponsive scaling for this page (other pages still work) */}
        <meta name="viewport" content="width=1280"></meta>
      </Head>
      <AppLayout>
        <ConfiguratorStateProvider chartId={chartId}>
          <ChartEditor />
        </ConfiguratorStateProvider>
      </AppLayout>
    </>
  );
};

export default ChartConfiguratorPage;
