import React from "react";
import { Box, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview } from "./dataset-preview";
import { DataSetHint, Success } from "./hint";

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
            <Box variant="container.chart">
              <DataSetPreview dataSetIri={dataSetPreviewIri} />
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
              <ChartPreview dataSetIri={state.dataSet} />
            </Box>
          )}
          {state.state === "PUBLISHED" && (
            <>
              <Success />
              <Box variant="container.chart">
                <ChartPreview dataSetIri={state.dataSet} />
              </Box>
            </>
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
