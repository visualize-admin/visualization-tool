import { Box, Button } from "@theme-ui/components";
import * as React from "react";

export const ButtonNone = () => (
  <Button
    variant="outline"
    sx={{
      width: ["100%", "100%", "100%"],
      textAlign: "left",
      mb: 3,
      borderColor: "monochrome500",
    }}
  >
    <Box sx={{ color: "gray" }}> </Box>
    <Box sx={{ color: "gray" }}>None</Box>
  </Button>
);
