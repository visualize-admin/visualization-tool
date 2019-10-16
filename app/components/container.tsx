import * as React from "react";
import { Box, Text, SxStyleProp } from "rebass";

export const Container = ({
  title,
  sx,
  children
}: {
  title?: string;
  sx?: SxStyleProp;
  children?: React.ReactNode;
}) => (
  <Box variant="container.root" sx={sx}>
    {title && (
      <Box variant="container.header">
        <Text variant="meta">{title}</Text>
      </Box>
    )}
    {children}
  </Box>
);

export const MiddleContainer = ({
  children
}: {
  children?: React.ReactNode;
}) => (
  <Container sx={{ my: 4, mx: 3, width: "638px", minHeight: "350px" }}>
    {children}
  </Container>
);
