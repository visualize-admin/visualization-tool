import * as React from "react";
import { Box, Text } from "rebass";

export const ContainerTitle = ({ children }: { children: React.ReactNode }) => (
  <Box variant="container.header">
    <Text variant="meta">{children}</Text>
  </Box>
);
