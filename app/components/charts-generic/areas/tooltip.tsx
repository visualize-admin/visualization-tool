import * as React from "react";
import { Box } from "theme-ui";
import { RulerProps } from "../annotations/ruler";

export const AreaTooltip = React.memo(
  ({ segments }: { segments: RulerProps[] }) => {
    return (
      <Box>
        {segments.map(segment => (
          <Box>{segment.body}</Box>
        ))}
      </Box>
    );
  }
);
