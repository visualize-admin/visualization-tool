import React from "react";
import { Box, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview } from "./dataset-preview";
import { DataSetHint } from "./hint";

export const PanelMiddle = ({
  dataSetPreviewIri
}: {
  dataSetPreviewIri?: string;
}) => {
  const [state] = useConfiguratorState();

  return (
    <>
      {state.state === "SELECTING_DATASET" ? (
        <>
          {dataSetPreviewIri ? (
            <Flex variant="container.chart">
              <DataSetPreview dataSetIri={dataSetPreviewIri} />
            </Flex>
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
            state.state === "DESCRIBING_CHART" ||
            state.state === "PUBLISHING") && (
            <Flex variant="container.chart"               flexDirection="column"
            >
              <ChartPreview dataSetIri={state.dataSet} />
            </Flex>
          )}
        </>
      )}
      {/* ACTIONS */}
      <ActionBar dataSetIri={dataSetPreviewIri}></ActionBar>
      {process.env.NODE_ENV === "development" && (
        <Box my={3} p={2} bg="muted">
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </Box>
      )}
    </>
  );
};
