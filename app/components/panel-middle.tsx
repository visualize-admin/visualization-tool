import React from "react";
import { Box, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview } from "./dataset-preview";
import { DataSetHint, Success } from "./hint";

export const PanelMiddle = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri?: string;
}) => {
  const [state] = useConfiguratorState();

  return (
    <Box as="section" variant="container.middle" data-name="panel-middle">
      {chartId === "new" ? (
        <>
          {dataSetIri ? (
            <Box variant="container.chart">
              <DataSetPreview dataSetIri={dataSetIri} />
            </Box>
          ) : (
            <Flex
              variant="container.chart"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <DataSetHint />
            </Flex>
          )}
        </>
      ) : (
        <>
          {(state.state === "SELECTING_CHART_TYPE" ||
            state.state === "CONFIGURING_CHART" ||
            state.state === "DESCRIBING_CHART") && (
            <Box variant="container.chart">
              <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
            </Box>
          )}
          {state.state === "PUBLISHED" && (
            <>
              <Success />
              <Box variant="container.chart">
                <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
              </Box>
            </>
          )}
        </>
      )}

      {/* ACTIONS */}
      <ActionBar chartId={chartId} dataSetIri={dataSetIri}></ActionBar>

      <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box>
    </Box>
  );
};
