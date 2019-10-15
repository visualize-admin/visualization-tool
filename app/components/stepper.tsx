import * as React from "react";
import { Button, Box, Flex } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";

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
  const [state, dispatch] = useConfiguratorState();

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
      {status === "past" ? <Check /> : stepNumber}
    </Flex>
  </Button>
);

export const Check = ({ size = 24, color = "currentColor" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);
