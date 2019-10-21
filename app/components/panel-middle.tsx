import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Button } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview } from "./dataset-preview";

export const PanelMiddle = ({
  chartId,
  dataSetIri
}: {
  chartId: string;
  dataSetIri: string;
}) => {
  const [state, dispatch] = useConfiguratorState();

  return (
    <Box variant="container.middle" data-name="panel-middle">
      <Box variant="container.chart">
        {chartId === "new" ? (
          <DataSetPreview dataSetIri={dataSetIri} />
        ) : (
          <>
            {(state.state === "SELECTING_CHART_TYPE" ||
              state.state === "CONFIGURING_CHART") && (
              <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
            )}
          </>
        )}
      </Box>

      {/* ACTIONS */}
      <ActionBar>
        {chartId === "new" ? (
          <Button
            variant="primary"
            onClick={() =>
              dispatch({
                type: "DATASET_SELECTED",
                value: dataSetIri
              })
            }
            sx={{ width: "112px", ml: "auto" }}
            disabled={!dataSetIri}
          >
            <Trans>Weiter</Trans>
          </Button>
        ) : (
          <>
            {state.state === "SELECTING_CHART_TYPE" && (
              <>
                {/* <Button
                  variant="primary"
                  onClick={() =>
                    dispatch({
                      type: "INITIALIZED"
                      // value: state.dataSet
                    })
                  }
                  sx={{ width: "112px", ml: "auto" }}
                  disabled={false}
                >
                  <Trans>Zurück</Trans>
                </Button> */}
                <Button
                  variant="primary"
                  onClick={() => dispatch({ type: "CHART_TYPE_SELECTED" })}
                  sx={{ ml: "auto" }}
                  disabled={state.chartConfig.chartType === "none"}
                >
                  <Trans>Weiter</Trans>
                </Button>
              </>
            )}
            {state.state === "CONFIGURING_CHART" && (
              <>
                <Button
                  variant="secondary"
                  onClick={() =>
                    dispatch({
                      type: "DATASET_SELECTED",
                      value: state.dataSet
                    })
                  }
                  sx={{ mr: "auto" }}
                  disabled={false}
                >
                  <Trans>Zurück</Trans>
                </Button>
                <Button
                  variant="success"
                  onClick={() => dispatch({ type: "PUBLISH" })}
                  sx={{ ml: "auto" }}
                  // disabled={state.chartConfig.chartType === "none"}
                >
                  <Trans>Publizieren</Trans>
                </Button>
              </>
            )}
          </>
        )}
      </ActionBar>
      {/* <Box my={3} p={2} bg="muted">
        <pre>{chartId}</pre>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </Box> */}
    </Box>
  );
};
