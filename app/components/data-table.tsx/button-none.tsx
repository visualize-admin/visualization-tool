import { Box, Button } from "@theme-ui/components";
import * as React from "react";

export const ButtonNone = () => (
  <Button
    variant="outline"
    sx={{
      width: ["100%", "100%", "100%"],
      textAlign: "left",
      mb: 3,
    }}
  >
    <Box sx={{ color: "gray" }}> </Box>
    <Box>None</Box>
  </Button>
);
