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
  const [dataSetPreview, updateDataSetPreview] = React.useState({
    iri: "",
    label: ""
  });

  return (
    <Box bg="muted">
      {/* <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box> */}

      <Flex justifyContent="space-between" alignItems="flex-start">
        <PanelLeft
          chartId={chartId}
          dataSetPreview={dataSetPreview}
          updateDataSetPreview={updateDataSetPreview}
        />

        <PanelMiddle chartId={chartId} dataSetPreview={dataSetPreview} />

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
