import { Trans } from "@lingui/macro";
import React from "react";
import { Box, Button, Link } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { ActionBar } from "./action-bar";
import { ChartPreview } from "./chart-preview";
import { DataSetPreview } from "./dataset-preview";
import { LocalizedLink } from "./links";
import { Success } from "./hint";

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
      {chartId === "new" ? (
        <Box variant="container.chart">
          <DataSetPreview dataSetIri={dataSetIri} />
        </Box>
      ) : (
        <>
          {(state.state === "SELECTING_CHART_TYPE" ||
            state.state === "CONFIGURING_CHART") && (
            <Box variant="container.chart">
              <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
            </Box>
          )}
          {state.state === "PUBLISHED" && (
            <>
              <Success>
                <LocalizedLink
                  href={`/[locale]/config?key=${state.configKey}`}
                  passHref
                >
                  <Link sx={{ textDecoration: "underline", cursor: "pointer" }}>
                    {state.configKey}
                  </Link>
                </LocalizedLink>
              </Success>
              <Box variant="container.chart">
                <ChartPreview chartId={chartId} dataSetIri={state.dataSet} />
              </Box>
            </>
          )}
        </>
      )}

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
                <LocalizedLink
                  href={{
                    pathname: "/[locale]/chart/[chartId]",
                    query: { chartId: "new" }
                  }}
                  passHref
                >
                  <Button as="a" variant="secondary">
                    <Trans>Zurück</Trans>
                  </Button>
                </LocalizedLink>
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
                  variant="primary"
                  onClick={() => dispatch({ type: "PUBLISH" })}
                  sx={{ ml: "auto" }}
                  // disabled={state.chartConfig.chartType === "none"}
                >
                  <Trans>Publizieren</Trans>
                </Button>
              </>
            )}
            {state.state === "PUBLISHED" && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => dispatch({ type: "CHART_TYPE_SELECTED" })}
                  sx={{ mr: "auto" }}
                  disabled
                >
                  <Trans>Bearbeiten</Trans>
                </Button>
                <LocalizedLink
                  href={{
                    pathname: "/[locale]/chart/[chartId]",
                    query: { chartId: "new" }
                  }}
                  passHref
                >
                  <Button as="a" variant="outline">
                    <Trans>Neue Visualisierung</Trans>
                  </Button>
                </LocalizedLink>
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
