import * as React from "react";
import { Box } from "theme-ui";

export const ScatterplotTooltip = React.memo(
  ({ content }: { content: $FixMe }) => {
    return (
      <Box>
        {content.segment && <Box>{content.segment}</Box>}
        <Box>{content.x}</Box>
        <Box>{content.y}</Box>
      </Box>
    );
  }
);
