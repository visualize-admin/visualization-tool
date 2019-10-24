import * as React from "react";

import { Box, Text, Flex } from "rebass";
import { Icon } from "../../icons";

export const ControlSection = ({
  title,
  note,
  children
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) => {
  const [show, toggle] = React.useState(true);
  // FIXME: Translation problem here... Pass the message id as prop?
  return (
    <Box as="section" variant="controlSection">
      <Flex
        as="button"
        variant="controlSectionTitle"
        justifyContent="space-between"
        onClick={() => toggle(!show)}
      >
        <Flex justifyContent="flex-start">
          <Icon name={show ? "chevrondown" : "chevronright"} />
          {/* FIXME: verify heading hierarchy */}
          <Text variant="table" as="h5">
            {title}
          </Text>
        </Flex>
        {note && (
          <Text variant="table" sx={{ fontWeight: "light" }}>
            {note}
          </Text>
        )}
      </Flex>
      {show && <Box variant="controlSectionContent">{children}</Box>}
    </Box>
  );
};
