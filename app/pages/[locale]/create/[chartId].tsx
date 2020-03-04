import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import React from "react";
import { ChartEditor } from "../../../components/editor/chart-editor";
import { AppLayout } from "../../../components/layout";
import { ConfiguratorStateProvider } from "../../../domain/configurator-state";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const ChartConfiguratorPage: NextPage = () => {
  const chartId = useChartId();

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
