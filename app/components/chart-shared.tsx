import { Box } from "@mui/material";
import { ReactNode } from "react";

export const ChartFiltersMetadataWrapper = ({
  filters,
  metadataPanel,
}: {
  filters?: ReactNode;
  metadataPanel?: ReactNode;
}) => {
  return (
    <Box sx={{ position: "relative", mt: 4 }}>
      {/* As metadata is absolutely positioned, we need to give the container some height so it's correctly aligned. */}
      {filters ? filters : <div style={{ height: 28 }} />}
      {metadataPanel}
    </Box>
  );
};
