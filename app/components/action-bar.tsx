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

  const nextDisabled =
    !canTransitionToNextStep(state, dataSetMetadata) ||
    state.state === "PUBLISHING";
  const previousDisabled =
    !canTransitionToPreviousStep(state) || state.state === "PUBLISHING";

  const previousLabel = <Trans>Previous</Trans>;
  const nextLabel =
    state.state === "DESCRIBING_CHART" || state.state === "PUBLISHING" ? (
      <Trans>Publish</Trans>
    ) : (
      <Trans>Next</Trans>
    );

  return (
    <Flex role="navigation" variant="actionBar" justifyContent="space-between">
      {state.state === "SELECTING_DATASET" ? (
        <Button
          variant="primary"
          onClick={goNext}
          sx={{ width: "112px", ml: "auto" }}
          disabled={nextDisabled}
        >
          {nextLabel}
        </Button>
      ) : state.state === "SELECTING_CHART_TYPE" ? (
        <>
          <LocalizedLink
            pathname="/[locale]/chart/[chartId]"
            query={{ chartId: "new" }}
            passHref
          >
            <Button as="a" variant="secondary">
              {previousLabel}
            </Button>
          </LocalizedLink>
          <Button
            variant="primary"
            onClick={goNext}
            sx={{ ml: "auto" }}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="secondary"
            onClick={goPrevious}
            sx={{ mr: "auto" }}
            disabled={previousDisabled}
          >
            {previousLabel}
          </Button>
          <Button
            variant="primary"
            onClick={goNext}
            sx={{ ml: "auto" }}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        </>
      )}
    </Flex>
  );
};
