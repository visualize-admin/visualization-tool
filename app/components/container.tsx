import * as React from "react";
import { Box, Text } from "rebass";

export const Container = ({
  side,
  children
}: {
  side: "left" | "right";
  children?: React.ReactNode;
}) => <Box variant={`container.${side}`}>{children}</Box>;

export const ContainerTitle = ({ children }: { children: React.ReactNode }) => (
  <Box variant="container.header">
    <Text variant="meta">{children}</Text>
  </Box>
);
