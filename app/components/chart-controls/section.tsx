import * as React from "react";

import { Box, Text, Flex } from "rebass";

export const ControlSection = ({
  title,
  note,
  children
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) => {
  return (
    <Box as="section">
      <Flex variant="controlSectionTitle" justifyContent="space-between">
        {/* FIXME: verify heading hierarchy */}
        <Text variant="table" as="h5">
          {title}
        </Text>
        <Text variant="table" sx={{ fontWeight: "light" }}>
          {note}
        </Text>
      </Flex>
      <Box variant="controlSectionContent">{children}</Box>
    </Box>
  );
};
