import { Box, Typography } from "@mui/material";
import { LegendItem } from "@/charts/shared/legend-color";
import { TooltipValue } from "@/charts/shared/interaction/tooltip";

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
        <Typography component="div" variant="caption" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Typography>
      )}
      {segment && (
        <Typography component="div" variant="caption">
          {segment}
        </Typography>
      )}
      {yValue && (
        <Typography component="div" variant="caption">
          {yValue}
          {yError ? <> ± {yError}</> : null}
        </Typography>
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
        <Typography component="div" variant="caption" sx={{ fontWeight: "bold" }}>
          {xValue}
        </Typography>
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
        <Typography component="div" variant="caption" sx={{ fontWeight: "bold" }}>
          {firstLine}
        </Typography>
      )}
      {secondLine && (
        <Typography component="div" variant="caption">
          {secondLine}
        </Typography>
      )}
      {thirdLine && (
        <Typography component="div" variant="caption">
          {thirdLine}
        </Typography>
      )}
    </Box>
  );
};
