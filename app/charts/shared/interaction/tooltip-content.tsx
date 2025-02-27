import { Box, Typography } from "@mui/material";

import { TooltipValue } from "@/charts/shared/interaction/tooltip";
import { LegendItem } from "@/charts/shared/legend-color";

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
    <div>
      {xValue && (
        <Typography
          component="div"
          variant="caption"
          sx={{ fontWeight: "bold", whiteSpace: "wrap" }}
        >
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
          {yError ?? null}
        </Typography>
      )}
    </div>
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
        <Typography
          component="div"
          variant="caption"
          sx={{ fontWeight: "bold" }}
        >
          {xValue}
        </Typography>
      )}
      {segmentValues.map((d, i) => (
        <LegendItem
          key={i}
          item={`${d.label}: ${d.value}${d.error ?? ""}`}
          color={d.color}
          symbol={d.symbol ?? "square"}
          usage="tooltip"
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
        <Typography
          component="div"
          variant="caption"
          sx={{ fontWeight: "bold" }}
        >
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
