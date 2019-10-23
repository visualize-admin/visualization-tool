import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box, Flex } from "rebass";
import { AppLayout } from "../../../components/layout";
import { PanelLeft } from "../../../components/panel-left";
import { PanelMiddle } from "../../../components/panel-middle";
import { PanelRight } from "../../../components/panel-right";
import { Stepper } from "../../../components/stepper";
import { DataCubeProvider } from "../../../domain";
import { ConfiguratorStateProvider } from "../../../domain/configurator-state";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const ChartCreator = ({ chartId }: { chartId: string }) => {
  // Local state, the dataset preview doesn't need to be persistent.
  const [dataSetPreviewIri, updateDataSetPreviewIri] = React.useState<string>();

  return (
    <Box bg="muted">
      <Flex justifyContent="space-between" alignItems="flex-start">
        <PanelLeft
          chartId={chartId}
          dataSetPreviewIri={dataSetPreviewIri}
          updateDataSetPreviewIri={updateDataSetPreviewIri}
        />

        <PanelMiddle chartId={chartId} dataSetIri={dataSetPreviewIri} />

        <PanelRight chartId={chartId} />
      </Flex>
    </Box>
  );
};

const ChartConfiguratorPage: NextPage = () => {
  const chartId = useChartId();

  return (
    <DataCubeProvider>
      <AppLayout>
        <ConfiguratorStateProvider chartId={chartId}>
          <Stepper />
          <ChartCreator chartId={chartId} />
        </ConfiguratorStateProvider>
      </AppLayout>
    </DataCubeProvider>
  );
};

export default ChartConfiguratorPage;
