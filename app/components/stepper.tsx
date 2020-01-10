import React, { useMemo } from "react";
import { Button, Flex, Text, Box } from "@theme-ui/components";
import {
  useConfiguratorState,
  ConfiguratorStateAction
} from "../domain/configurator-state";
import { Icon } from "../icons";
import { Trans } from "@lingui/macro";

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
  "DESCRIBING_CHART"
];

export const Stepper = () => {
  const [{ state }, dispatch] = useConfiguratorState();

  return useMemo(() => {
    const currentStepIndex = steps.indexOf(state as $IntentionalAny);
    return (
      <Flex variant="stepper.root" sx={{ justifyContent: "center" }}>
        <Flex
          sx={{
            position: "relative",
            justifyContent: "center",
            alignItems: "flex-start"
          }}
        >
          <Box variant="stepper.line" />
          {steps.map((step, i) => (
            <Step
              key={step}
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
            ></Step>
          ))}
        </Flex>
      </Flex>
    );
  }, [state, dispatch]);
};

export const Step = ({
  stepState,
  stepNumber,
  status,
  dispatch
}: {
  stepState: StepState;
  stepNumber: number;
  status: StepStatus;
  dispatch?: React.Dispatch<ConfiguratorStateAction>;
}) => {
  const onClick = React.useCallback(() => {
    if (status === "past" && dispatch) {
      dispatch({
        type: "STEP_PREVIOUS",
        to: stepState
      });
    }
  }, [status, stepState, dispatch]);

  return (
    <Button
      disabled={status !== "past"}
      variant="step"
      onClick={onClick}
      sx={{ cursor: status === "past" ? "pointer" : undefined }}
    >
      <Flex
        px={4}
        sx={{
          height: "100%",
          bg: "monochrome100",
          zIndex: 5,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Flex
          sx={{ justifyContent: "center", alignItems: "center" }}
          variant={`step.${status}`}
        >
          {status === "past" ? <Icon name="check" size={20} /> : stepNumber}
        </Flex>
      </Flex>

      <StepLabel stepState={stepState} highlight={status === "current"} />
    </Button>
  );
};

export const StepLabel = ({
  stepState,
  highlight
}: {
  stepState: StepState;
  highlight: boolean;
}) => {
  switch (stepState) {
    case "SELECTING_DATASET":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome800" : "monochrome700",
            fontWeight: highlight ? "bold" : "regular"
          }}
          variant="paragraph2"
        >
          <Trans id="step.dataset">Dataset</Trans>
        </Text>
      );
    case "SELECTING_CHART_TYPE":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome800" : "monochrome700",
            fontWeight: highlight ? "bold" : "regular"
          }}
          variant="paragraph2"
        >
          <Trans id="step.visualization.type">Visualization Type</Trans>
        </Text>
      );
    case "CONFIGURING_CHART":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome800" : "monochrome700",
            fontWeight: highlight ? "bold" : "regular"
          }}
          variant="paragraph2"
        >
          <Trans id="step.adjust">Adjust</Trans>
        </Text>
      );
    case "DESCRIBING_CHART":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome800" : "monochrome700",
            fontWeight: highlight ? "bold" : "regular"
          }}
          variant="paragraph2"
        >
          <Trans id="step.annotate">Annotate</Trans>
        </Text>
      );
  }
};
