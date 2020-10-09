import React, { useMemo } from "react";
import { Button, Flex, Text, Box } from "@theme-ui/components";
import {
  useConfiguratorState,
  ConfiguratorStateAction,
} from "../domain/configurator-state";
import { Icon } from "../icons";
import { Trans } from "@lingui/macro";
import { useTheme } from "../themes";

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

export const Stepper = () => {
  const [{ state }, dispatch] = useConfiguratorState();

  return useMemo(() => {
    const currentStepIndex = steps.indexOf(state as $IntentionalAny);
    return (
      <Flex
        sx={{
          justifyContent: "center",
          position: "relative",
          pt: 2,
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
            position: "relative",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Line */}
          <Box
            sx={{
              position: "absolute",
              width: "calc(100% - 156px)", // Remove: 2 * buttons.step.width / 2
              transform: "translateY(-50%)",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "monochrome400",
              zIndex: 0,
              mb: "3px",
            }}
          />
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
            />
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
        bg: "monochrome100",
        zIndex: 2,
        appearance: "none",
        mr: 7,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "baseline",
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
          pl: 2,
          pr: 2,
        }}
      >
        {/* Icon */}
        <Flex
          sx={{
            width: "20px",
            height: "20px",
            mb: 1,
            borderRadius: "circle",
            fontSize: 3,
            fontFamily: "body",
            justifyContent: "center",
            alignItems: "center",
            color: "monochrome100",

            bg:
              status === "past"
                ? "monochrome800"
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
        <Text
          sx={{
            color: highlight ? "monochrome800" : "monochrome700",
            fontWeight: highlight ? "bold" : "regular",
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
            fontWeight: highlight ? "bold" : "regular",
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
            fontWeight: highlight ? "bold" : "regular",
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
            fontWeight: highlight ? "bold" : "regular",
          }}
          variant="paragraph2"
        >
          <Trans id="step.annotate">Annotate</Trans>
        </Text>
      );
  }
};
