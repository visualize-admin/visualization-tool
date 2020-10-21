import React, { Fragment, useMemo } from "react";
import { Button, Flex, Text, Box } from "@theme-ui/components";
import { useConfiguratorState, ConfiguratorStateAction } from "../configurator";
import { Icon } from "../icons";
import { Trans } from "@lingui/macro";
import { useTheme } from "../themes";
import { ActionBar } from "./action-bar";

export type StepStatus = "past" | "current" | "future";
type StepState =
  | "SELECTING_DATASET"
  | "SELECTING_CHART_TYPE"
  | "CONFIGURING_CHART"
  | "DESCRIBING_CHART";

const steps: Array<StepState> = [
  "SELECTING_DATASET",
  "SELECTING_CHART_TYPE",
  "CONFIGURING_CHART",
  "DESCRIBING_CHART",
];

export const Stepper = ({ dataSetIri }: { dataSetIri?: string }) => {
  const [{ state }, dispatch] = useConfiguratorState();

  return useMemo(() => {
    const currentStepIndex = steps.indexOf(state as $IntentionalAny);
    return (
      <Flex
        sx={{
          justifyContent: ["flex-start", "flex-start", "center"],
          alignItems: "center",
          position: "relative",
          py: 2,
          bg: "monochrome100",
          borderBottomWidth: "1px",
          borderBottomStyle: "solid",
          borderBottomColor: "monochrome500",
          overflow: "hidden",
        }}
      >
        {/* Stepper container */}
        <Flex
          sx={{
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {steps.map((step, i) => (
            <Fragment key={step}>
              <Step
                stepNumber={i + 1}
                stepState={step}
                status={
                  currentStepIndex === i
                    ? "current"
                    : currentStepIndex > i || state === "PUBLISHING"
                    ? "past"
                    : "future"
                }
                dispatch={dispatch}
              />
              {i < steps.length - 1 && (
                // Connection line
                <Box
                  sx={{
                    width: "4rem",
                    height: 0,
                    borderBottomWidth: "1px",
                    borderBottomStyle: "solid",
                    borderBottomColor: "monochrome400",
                    mb: "3px",
                  }}
                />
              )}
            </Fragment>
          ))}
        </Flex>

        <ActionBar dataSetIri={dataSetIri} />
      </Flex>
    );
  }, [state, dataSetIri, dispatch]);
};

export const Step = ({
  stepState,
  stepNumber,
  status,
  dispatch,
}: {
  stepState: StepState;
  stepNumber: number;
  status: StepStatus;
  dispatch?: React.Dispatch<ConfiguratorStateAction>;
}) => {
  const theme = useTheme();
  const onClick = React.useCallback(() => {
    if (status === "past" && dispatch) {
      dispatch({
        type: "STEP_PREVIOUS",
        to: stepState,
      });
    }
  }, [status, stepState, dispatch]);

  return (
    <Button
      variant="reset"
      sx={{
        appearance: "none",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        cursor: status === "past" ? "pointer" : undefined,
      }}
      disabled={status !== "past"}
      onClick={onClick}
    >
      <Flex
        sx={{
          bg: "monochrome100",
          zIndex: 5,
          justifyContent: "center",
          alignItems: "center",
          px: 2,
        }}
      >
        {/* Icon */}
        <Flex
          sx={{
            width: "20px",
            height: "20px",
            borderRadius: "circle",
            fontSize: 3,
            fontFamily: "body",
            justifyContent: "center",
            alignItems: "center",
            color: "monochrome100",

            bg:
              status === "past"
                ? "monochrome700"
                : status === "current"
                ? "brand"
                : "monochrome600",
          }}
        >
          {status === "past" ? (
            <Icon name="check" size={20} color={theme.colors.monochrome100} />
          ) : (
            stepNumber
          )}
        </Flex>
      </Flex>

      <StepLabel stepState={stepState} highlight={status === "current"} />
    </Button>
  );
};

export const StepLabel = ({
  stepState,
  highlight,
}: {
  stepState: StepState;
  highlight: boolean;
}) => {
  switch (stepState) {
    case "SELECTING_DATASET":
      return (
        <StepLabelText
          label={<Trans id="step.dataset">Dataset</Trans>}
          highlight={highlight}
        />
      );
    case "SELECTING_CHART_TYPE":
      return (
        <StepLabelText
          label={<Trans id="step.visualization.type">Visualization Type</Trans>}
          highlight={highlight}
        />
      );
    case "CONFIGURING_CHART":
      return (
        <StepLabelText
          label={<Trans id="step.adjust">Adjust</Trans>}
          highlight={highlight}
        />
      );
    case "DESCRIBING_CHART":
      return (
        <StepLabelText
          label={<Trans id="step.annotate">Annotate</Trans>}
          highlight={highlight}
        />
      );
  }
};

const StepLabelText = ({
  highlight,
  label,
}: {
  highlight: boolean;
  label: React.ReactNode;
}) => {
  return (
    <>
      {/* Add background colored bold label underneath the actual
    label, to avoid changing container's size when the text becomes bold. */}
      <Text
        sx={{
          fontWeight: "bold",
          color: "monochrome000",
          position: "relative",
        }}
        variant="paragraph2"
      >
        {label}
        <Text
          sx={{
            position: "absolute",
            left: 0,
            top: 0,
            color: highlight ? "monochrome800" : "monochrome700",
            fontWeight: highlight ? "bold" : "regular",
          }}
          variant="paragraph2"
        >
          {label}
        </Text>
      </Text>
    </>
  );
};
