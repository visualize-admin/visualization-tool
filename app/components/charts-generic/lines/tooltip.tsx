import * as React from "react";
import { Box } from "theme-ui";

export const LineTooltip = React.memo(({ content }: { content: $FixMe }) => {
  return (
    <Box>
      <Box>{content.segment}</Box>
      <Box>{content.x}</Box>
      <Box>{content.y}</Box>
    </Box>
  );
});
