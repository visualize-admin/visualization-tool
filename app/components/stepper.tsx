import * as React from "react";
import { Button, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { Icon } from "../icons";

export type StepStatus = "past" | "current" | "future";
type StepState =
  | "SELECTING_DATASET"
  | "SELECTING_CHART_TYPE"
  | "CONFIGURING_CHART"
  | "PUBLISHING";

const steps: Array<StepState> = [
  "SELECTING_DATASET",
  "SELECTING_CHART_TYPE",
  "CONFIGURING_CHART",
  "PUBLISHING"
];

export const Stepper = () => {
  const [state] = useConfiguratorState();

  return (
    <Flex variant="stepper.root" justifyContent="center">
      {steps.map((step, i) => (
        <Step
          key={step}
          stepNumber={i + 1}
          stepState={step}
          status={state.state === step ? "current" : "future"}
        ></Step>
      ))}
    </Flex>
  );
};

export const Step = ({
  stepState,
  stepNumber,
  status
}: {
  stepState: StepState;
  stepNumber: number;
  status: StepStatus;
}) => (
  <Button variant={`step.${status}`}>
    <Flex
      justifyContent="center"
      alignItems="center"
      sx={{ width: "100%", height: "100%" }}
    >
      {status === "past" ? <Icon name="check" /> : stepNumber}
    </Flex>
  </Button>
);
