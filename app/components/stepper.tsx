import * as React from "react";
import { Button, Flex, Text, Box } from "rebass";
import { useConfiguratorState } from "../domain/configurator-state";
import { Icon } from "../icons";
import { Trans } from "@lingui/macro";

export type StepStatus = "past" | "current" | "future";
type StepState =
  | "SELECTING_DATASET"
  | "SELECTING_CHART_TYPE"
  | "CONFIGURING_CHART"
  | "DESCRIBING_CHART"
  | "PUBLISHED";

const steps: Array<StepState> = [
  "SELECTING_DATASET",
  "SELECTING_CHART_TYPE",
  "CONFIGURING_CHART",
  "DESCRIBING_CHART",
  "PUBLISHED"
];

export const Stepper = () => {
  const [state] = useConfiguratorState();

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
            status={state.state === step ? "current" : "future"}
          ></Step>
        ))}
      </Flex>
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
  <Button disabled variant="step">
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
        {status === "past" ? <Icon name="check" /> : stepNumber}
      </Flex>
    </Flex>

    <StepLabel stepState={stepState} highlight={status === "current"} />
  </Button>
);

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
    case "PUBLISHED":
      return (
        <Text
          sx={{
            color: highlight ? "monochrome.800" : "monochrome.700",
            fontFamily: highlight ? "frutigerBold" : "frutigerRegular"
          }}
          variant="paragraph2"
        >
          <Trans>Share & embed</Trans>
        </Text>
      );
  }
};
