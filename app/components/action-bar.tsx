import { Trans } from "@lingui/macro";
import React from "react";
import { Button, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { LocalizedLink } from "./links";
import { useDataSetAndMetadata } from "../domain";

export const ActionBar = ({ dataSetIri }: { dataSetIri?: string }) => {
  const [state, dispatch] = useConfiguratorState();
  const { data: dataSetMetadata } = useDataSetAndMetadata(dataSetIri);
  return (
    <Flex role="navigation" variant="actionBar" justifyContent="space-between">
      {state.state === "SELECTING_DATASET" ? (
        <Button
          variant="primary"
          onClick={() => {
            if (dataSetIri && dataSetMetadata) {
              dispatch({
                type: "DATASET_SELECTED",
                value: { dataSet: dataSetIri, title: "", dataSetMetadata }
              });
            }
          }}
          sx={{ width: "112px", ml: "auto" }}
          disabled={!dataSetMetadata || !dataSetIri}
        >
          <Trans>Next</Trans>
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
                  <Trans>Previous</Trans>
                </Button>
              </LocalizedLink>
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "CHART_TYPE_SELECTED" })}
                sx={{ ml: "auto" }}
                disabled={state.chartConfig === undefined}
              >
                <Trans>Next</Trans>
              </Button>
            </>
          )}
          {state.state === "CONFIGURING_CHART" && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  if (dataSetMetadata) {
                    dispatch({
                      type: "DATASET_SELECTED",
                      value: {
                        dataSet: state.dataSet,
                        title: "",
                        dataSetMetadata
                      }
                    });
                  }
                }}
                sx={{ mr: "auto" }}
                disabled={false}
              >
                <Trans>Previous</Trans>
              </Button>
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "CHART_CONFIGURED" })}
                sx={{ ml: "auto" }}
                // disabled={state.chartConfig.chartType === "none"}
              >
                <Trans>Next</Trans>
              </Button>
            </>
          )}
          {state.state === "DESCRIBING_CHART" && (
            <>
              <Button
                variant="secondary"
                onClick={() => dispatch({ type: "CHART_TYPE_SELECTED" })}
                sx={{ mr: "auto" }}
              >
                <Trans>Previous</Trans>
              </Button>
              <Button
                variant="primary"
                onClick={() => dispatch({ type: "PUBLISH" })}
                sx={{ ml: "auto" }}
                // disabled={state.chartConfig.chartType === "none"}
              >
                <Trans>Publish</Trans>
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
                <Trans>Edit</Trans>
              </Button>
              <LocalizedLink
                href={{
                  pathname: "/[locale]/chart/[chartId]",
                  query: { chartId: "new" }
                }}
                passHref
              >
                <Button as="a" variant="outline">
                  <Trans>New Visualization</Trans>
                </Button>
              </LocalizedLink>
            </>
          )}
        </>
      )}
    </Flex>
  );
};
