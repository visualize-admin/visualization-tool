import * as React from "react";
import { Box, Text } from "rebass";

export const ControlList = ({
  label,
  children
}: {
  label?: string;
  children: React.ReactNode;
}) => {
  return (
    <Box as="section" sx={{ pt: 2 }}>
      {label && (
        <Text variant="meta" sx={{ pb: 2 }}>
          {label}
        </Text>
      )}
      {children}
    </Box>
  );
};
