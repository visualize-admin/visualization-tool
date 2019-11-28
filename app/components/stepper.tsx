import * as React from "react";
import { Button, Flex, Text, Box } from "rebass";
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
  const [state, dispatch] = useConfiguratorState();
  const currentStepIndex = steps.indexOf(state.state as $IntentionalAny);

  return (
    <Flex variant="stepper.root" justifyContent="center">
      <Flex
        justifyContent="center"
        alignItems="flex-start"
        sx={{ position: "relative" }}
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
                : currentStepIndex > i || state.state === "PUBLISHING"
                ? "past"
                : "future"
            }
            dispatch={dispatch}
          ></Step>
        ))}
      </Flex>
    </Flex>
  );
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
        justifyContent="center"
        alignItems="center"
        px={4}
        sx={{ height: "100%", bg: "monochrome.100", zIndex: 5 }}
      >
        <Flex
          justifyContent="center"
          alignItems="center"
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
            color: highlight ? "monochrome.800" : "monochrome.700",
            fontFamily: highlight ? "frutigerBold" : "frutigerRegular"
          }}
          variant="paragraph2"
        >
          <Trans>Dataset</Trans>
        </Text>
      );
    case "SELECTING_CHART_TYPE":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome.800" : "monochrome.700",
            fontFamily: highlight ? "frutigerBold" : "frutigerRegular"
          }}
          variant="paragraph2"
        >
          <Trans>Visualization Type</Trans>
        </Text>
      );
    case "CONFIGURING_CHART":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome.800" : "monochrome.700",
            fontFamily: highlight ? "frutigerBold" : "frutigerRegular"
          }}
          variant="paragraph2"
        >
          <Trans>Adjust</Trans>
        </Text>
      );
    case "DESCRIBING_CHART":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome.800" : "monochrome.700",
            fontFamily: highlight ? "frutigerBold" : "frutigerRegular"
          }}
          variant="paragraph2"
        >
          <Trans>Annotate</Trans>
        </Text>
      );
  }
};
