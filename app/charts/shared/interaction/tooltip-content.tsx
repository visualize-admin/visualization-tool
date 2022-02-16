import { Box, Text } from "theme-ui";
import { LegendItem } from "../legend-color";
import { TooltipValue } from "./tooltip";

// Generic
export const TooltipSingle = ({
  xValue,
  segment,
  yValue,
  yError,
}: {
  xValue?: string;
  segment?: string;
  yValue?: string;
  yError?: string;
}) => {
  return (
    <Box>
      {xValue && (
        <Text as="div" variant="meta" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Text>
      )}
      {segment && (
        <Text as="div" variant="meta">
          {segment}
        </Text>
      )}
      {yValue && (
        <Text as="div" variant="meta">
          {yValue}
          {yError ? <> ± {yError}</> : null}
        </Text>
      )}
    </Box>
  );
};

export const TooltipMultiple = ({
  xValue,
  segmentValues,
}: {
  xValue?: string;
  segmentValues: TooltipValue[];
}) => {
  return (
    <Box>
      {xValue && (
        <Text as="div" variant="meta" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Text>
      )}
      {segmentValues.map((segment, i) => (
        <LegendItem
          key={i}
          item={`${segment.label}: ${segment.value}`}
          color={segment.color}
          symbol="square"
        />
      ))}
    </Box>
  );
};

// Chart Specific
export const TooltipScatterplot = ({
  firstLine,
  secondLine,
  thirdLine,
}: {
  firstLine?: string;
  secondLine?: string;
  thirdLine?: string;
}) => {
  return (
    <Box>
      {firstLine && (
        <Text as="div" variant="meta" sx={{ fontWeight: "bold" }}>
          {firstLine}
        </Text>
      )}
      {secondLine && (
        <Text as="div" variant="meta">
          {secondLine}
        </Text>
      )}
      {thirdLine && (
        <Text as="div" variant="meta">
          {thirdLine}
        </Text>
      )}
    </Box>
  );
};
