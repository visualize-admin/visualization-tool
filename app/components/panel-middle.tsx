import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Button, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview, Preview } from "./dataset-selector";

export const PanelMiddle = ({
  chartId,
  dataSetPreview
}: {
  chartId: string;
  dataSetPreview: Preview;
}) => {
  const [state, dispatch] = useConfiguratorState();

  return (
    <Box variant="container.middle" data-name="panel-middle">
      <Flex
        variant="container.chart"
        justifyContent="center"
        alignItems="center"
      >
        {chartId === "new" ? (
          <DataSetPreview dataSetPreview={dataSetPreview} />
        ) : (
          <>
            {(state.state === "SELECTING_CHART_TYPE" ||
              state.state === "CONFIGURING_CHART") && (
              <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
            )}
          </>
        )}
      </Flex>

      {/* ACTIONS */}
      <ActionBar>
        {chartId === "new" ? (
          <Button
            variant="primary"
            onClick={() =>
              dispatch({
                type: "DATASET_SELECTED",
                value: dataSetPreview.iri
              })
            }
            sx={{ width: "112px", ml: "auto" }}
            disabled={!dataSetPreview.iri}
          >
            <Trans>Weiter</Trans>
          </Button>
        ) : (
          <>
            {state.state === "SELECTING_CHART_TYPE" && (
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "CHART_TYPE_SELECTED" })}
                sx={{ width: "112px", ml: "auto" }}
                disabled={state.chartConfig.chartType === "none"}
              >
                <Trans>Weiter</Trans>
              </Button>
            )}
            {state.state === "CONFIGURING_CHART" && (
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "PUBLISH" })}
                sx={{ width: "112px", ml: "auto" }}
                // disabled={state.chartConfig.chartType === "none"}
              >
                <Trans>Publizieren</Trans>
              </Button>
            )}
          </>
        )}
      </ActionBar>
    </Box>
  );
};
