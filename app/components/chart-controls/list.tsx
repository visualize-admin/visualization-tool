import * as React from "react";
import { Box } from "rebass";

export const ControlList = ({ children }: { children: React.ReactNode }) => {
  return <Box sx={{ pt: 2 }}>{children}</Box>;
};
