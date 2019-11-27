import { Trans } from "@lingui/macro";
import React, { useCallback } from "react";
import { Button, Flex } from "rebass";
import {
  useConfiguratorState,
  canTransitionToNextStep,
  canTransitionToPreviousStep
} from "../domain/configurator-state";
import { LocalizedLink } from "./links";
import { useDataSetAndMetadata } from "../domain";

export const ActionBar = ({ dataSetIri }: { dataSetIri?: string }) => {
  const [state, dispatch] = useConfiguratorState();
  const { data: dataSetMetadata } = useDataSetAndMetadata(dataSetIri);

  const goNext = useCallback(() => {
    if (dataSetMetadata) {
      dispatch({
        type: "STEP_NEXT",
        dataSetMetadata
      });
    }
  }, [dataSetMetadata, dispatch]);

  const goPrevious = useCallback(() => {
    dispatch({
      type: "STEP_PREVIOUS"
    });
  }, [dispatch]);

  const nextDisabled = !canTransitionToNextStep(state, dataSetMetadata);
  const previousDisabled = !canTransitionToPreviousStep(state);

  return (
    <Flex role="navigation" variant="actionBar" justifyContent="space-between">
      {state.state === "SELECTING_DATASET" ? (
        <Button
          variant="primary"
          onClick={goNext}
          sx={{ width: "112px", ml: "auto" }}
          disabled={nextDisabled}
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
                onClick={goNext}
                sx={{ ml: "auto" }}
                disabled={nextDisabled}
              >
                <Trans>Next</Trans>
              </Button>
            </>
          )}
          {(state.state === "CONFIGURING_CHART" ||
            state.state === "DESCRIBING_CHART") && (
            <>
              <Button
                variant="secondary"
                onClick={goPrevious}
                sx={{ mr: "auto" }}
                disabled={previousDisabled}
              >
                <Trans>Previous</Trans>
              </Button>
              <Button
                variant="primary"
                onClick={goNext}
                sx={{ ml: "auto" }}
                disabled={nextDisabled}
              >
                <Trans>Next</Trans>
              </Button>
            </>
          )}
          {state.state === "PUBLISHED" && (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  // TODO
                  console.log("TODO");
                }}
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
