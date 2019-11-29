import { NextPage } from "next";
import { useRouter } from "next/router";
import React from "react";
import { Box } from "rebass";
import { AppLayout } from "../../../components/layout";
import { PanelLeft } from "../../../components/panel-left";
import { PanelMiddle } from "../../../components/panel-middle";
import { ChartOptionsSelector } from "../../../components/chart-options-selector";
import { Stepper } from "../../../components/stepper";
import { DataCubeProvider } from "../../../domain";
import {
  ConfiguratorStateProvider,
  useConfiguratorState
} from "../../../domain/configurator-state";
import { ChartAnnotationsSelector } from "../../../components/chart-annotations-selector";

const useChartId = () => {
  const { query } = useRouter();

  const chartId = query.chartId as string; // Safe type cast because in the context of this page, chartId is always a string

  return chartId;
};

const ChartCreator = () => {
  // Local state, the dataset preview doesn't need to be persistent.
  // FIXME: for a11y, "updateDataSetPreviewIri" should also move focus to "Weiter" button (?)
  const [state] = useConfiguratorState();

  return (
    <Box
      bg="muted"
      sx={{
        display: "grid",
        gridTemplateColumns:
          "minmax(12rem, 20rem) minmax(22rem, 1fr) minmax(12rem, 20rem)",
        gridTemplateRows: "auto minmax(0, 1fr)",
        gridTemplateAreas: `
        "header header header"
        "left middle right"
        `,
        width: "100%",
        position: "fixed",
        // FIXME replace 96px with actual header size
        top: "96px",
        height: "calc(100vh - 96px)"
      }}
    >
      <Box as="section" role="navigation" sx={{ gridArea: "header" }}>
        <Stepper />
      </Box>

      <Box as="section" data-name="panel-left" variant="container.left">
        <PanelLeft />
      </Box>

      <Box as="section" data-name="panel-middle" variant="container.middle">
        <PanelMiddle dataSetPreviewIri={state.dataSet} />
      </Box>

      <Box as="section" data-name="panel-right" variant="container.right">
        {state.state === "CONFIGURING_CHART" && (
          <ChartOptionsSelector state={state} />
        )}
        {state.state === "DESCRIBING_CHART" && (
          <ChartAnnotationsSelector state={state} />
        )}
      </Box>
    </Box>
  );
};

const ChartConfiguratorPage: NextPage = () => {
  const chartId = useChartId();

  return (
    <DataCubeProvider>
      <AppLayout>
        <ConfiguratorStateProvider chartId={chartId}>
          <ChartCreator />
        </ConfiguratorStateProvider>
      </AppLayout>
    </DataCubeProvider>
  );
};

export default ChartConfiguratorPage;
