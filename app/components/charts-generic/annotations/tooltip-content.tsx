import { Box, Text } from "@theme-ui/components";
import { LegendItem } from "../legends/color";
import { TooltipValue } from "./tooltip";

// Generic
export const TooltipSingle = ({
  xValue,
  segment,
  yValue
}: {
  xValue?: string;
  segment?: string;
  yValue?: string;
}) => {
  return (
    <Box>
      {xValue && (
        <Text variant="meta" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Text>
      )}
      {segment && <Text variant="meta">{segment}</Text>}
      {yValue && <Text variant="meta">{yValue}</Text>}
    </Box>
  );
};

export const TooltipMultiple = ({
  xValue,
  segmentValues
}: {
  xValue?: string;
  segmentValues: TooltipValue[];
}) => {
  return (
    <Box>
      {xValue && (
        <Text variant="meta" sx={{ fontWeight: "bold" }}>
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
  thirdLine
}: {
  firstLine?: string;
  secondLine?: string;
  thirdLine?: string;
}) => {
  return (
    <Box>
      {firstLine && (
        <Text variant="meta" sx={{ fontWeight: "bold" }}>
          {firstLine}
        </Text>
      )}
      {secondLine && <Text variant="meta">{secondLine}</Text>}
      {thirdLine && <Text variant="meta">{thirdLine}</Text>}
    </Box>
  );
};
