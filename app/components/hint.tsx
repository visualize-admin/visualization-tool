import * as React from "react";
import { Box } from "rebass";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <Box
    // variant={"error"}
    sx={{ variant: "variants.hint", color: "error", borderColor: "error" }}
  >
    {children}
  </Box>
);

export const Loading = ({ children }: { children: React.ReactNode }) => (
  <Box variant={"loading"}>{children}</Box>
);
