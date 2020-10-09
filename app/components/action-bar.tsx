import { Trans } from "@lingui/macro";
import { Button, Flex } from "@theme-ui/components";
import React, { useCallback } from "react";
import {
  canTransitionToNextStep,
  canTransitionToPreviousStep,
  useConfiguratorState,
} from "../domain/configurator-state";
import { useDataCubeMetadataWithComponentValuesQuery } from "../graphql/query-hooks";
import { useLocale } from "../lib/use-locale";
import { LocalizedLink } from "./links";

export const ActionBar = ({ dataSetIri }: { dataSetIri?: string }) => {
  const [state, dispatch] = useConfiguratorState();
  const locale = useLocale();
  const [{ data }] = useDataCubeMetadataWithComponentValuesQuery({
    variables: { iri: dataSetIri ?? "", locale },
  });

  const goNext = useCallback(() => {
    if (data?.dataCubeByIri) {
      dispatch({
        type: "STEP_NEXT",
        dataSetMetadata: data?.dataCubeByIri,
      });
    }
  }, [data, dispatch]);

  const goPrevious = useCallback(() => {
    dispatch({
      type: "STEP_PREVIOUS",
    });
  }, [dispatch]);

  const nextDisabled =
    !canTransitionToNextStep(state, data?.dataCubeByIri) ||
    state.state === "PUBLISHING";
  const previousDisabled =
    !canTransitionToPreviousStep(state) || state.state === "PUBLISHING";

  const previousLabel = <Trans id="button.previous">Previous</Trans>;
  const nextLabel =
    state.state === "DESCRIBING_CHART" || state.state === "PUBLISHING" ? (
      <Trans id="button.publish">Publish</Trans>
    ) : (
      <Trans id="button.next">Next</Trans>
    );

  return (
    <Flex
      sx={{
        position: "absolute",
        right: 0,
        pr: 3,
        alignItems: "center",
      }}
    >
      {state.state === "SELECTING_DATASET" ? (
        <>
          <Button disabled variant="inline" sx={{ mr: 4 }}>
            {previousLabel}
          </Button>
          <Button
            variant="primarySmall"
            onClick={goNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        </>
      ) : state.state === "SELECTING_CHART_TYPE" ? (
        <>
          <LocalizedLink
            pathname="/[locale]/create/[chartId]"
            query={{ chartId: "new" }}
            passHref
          >
            <Button as="a" variant="inline" sx={{ mr: 4 }}>
              {previousLabel}
            </Button>
          </LocalizedLink>
          <Button
            variant="primarySmall"
            onClick={goNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        </>
      ) : (
        <>
          <Button
            variant="inline"
            onClick={goPrevious}
            sx={{ mr: 4 }}
            disabled={previousDisabled}
          >
            {previousLabel}
          </Button>
          <Button
            variant="primarySmall"
            onClick={goNext}
            disabled={nextDisabled}
          >
            {nextLabel}
          </Button>
        </>
      )}
    </Flex>
  );
};
