import React from "react";
import { Box, Flex } from "@theme-ui/components";
import { useConfiguratorState } from "../configurator";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview } from "./dataset-preview";
import { DataSetHint } from "./hint";
import { ChartPanel } from "./chart-panel";

export const PanelMiddle = ({
  dataSetPreviewIri,
}: {
  dataSetPreviewIri?: string;
}) => {
  const [state] = useConfiguratorState();

  return (
    <>
      {state.state === "SELECTING_DATASET" ? (
        <>
          {dataSetPreviewIri ? (
            <ChartPanel>
              <DataSetPreview dataSetIri={dataSetPreviewIri} />
            </ChartPanel>
          ) : (
            <ChartPanel
              sx={{
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <DataSetHint />
            </ChartPanel>
          )}
        </>
      ) : (
        <>
          {(state.state === "SELECTING_CHART_TYPE" ||
            state.state === "CONFIGURING_CHART" ||
            state.state === "DESCRIBING_CHART" ||
            state.state === "PUBLISHING") && (
            <ChartPanel sx={{ flexDirection: "column" }}>
              <ChartPreview dataSetIri={state.dataSet} />
            </ChartPanel>
          )}
        </>
      )}

      {process.env.NODE_ENV === "development" && (
        <Box my={3} p={2} bg="muted">
          <pre>{JSON.stringify(state, null, 2)}</pre>
        </Box>
      )}
    </>
  );
};
