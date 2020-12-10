import { Trans } from "@lingui/macro";
import NextLink from "next/link";
import { ReactNode, useCallback } from "react";
import { Button, Flex } from "theme-ui";
import {
  canTransitionToNextStep,
  canTransitionToPreviousStep,
  useConfiguratorState,
} from "..";
import { useDataCubeMetadataWithComponentValuesQuery } from "../../graphql/query-hooks";
import { useLocale } from "../../locales/use-locale";

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
          <NextButton
            label={nextLabel}
            onClick={goNext}
            disabled={nextDisabled}
          />
        </>
      ) : state.state === "SELECTING_CHART_TYPE" ? (
        <>
          <NextLink href="/create/new" passHref>
            <Button as="a" variant="inline" sx={{ mr: 4 }}>
              {previousLabel}
            </Button>
          </NextLink>
          <NextButton
            label={nextLabel}
            onClick={goNext}
            disabled={nextDisabled}
          />
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
          <NextButton
            label={nextLabel}
            onClick={goNext}
            disabled={nextDisabled}
          />
        </>
      )}
    </Flex>
  );
};

const NextButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string | ReactNode;
  onClick: () => void;
  disabled: boolean;
}) => (
  <Button
    variant="primary"
    sx={{ fontSize: 3, minWidth: 0, px: 4, py: 2 }}
    onClick={onClick}
    disabled={disabled}
  >
    {label}
  </Button>
);
