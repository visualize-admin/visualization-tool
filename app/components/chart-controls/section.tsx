import * as React from "react";

import { Box, Text, Flex, Heading } from "rebass";
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
    <Box variant="controlSection">
      <Heading as="h2">
        <Flex
          as="button"
          variant="controlSectionTitle"
          justifyContent="space-between"
          onClick={() => toggle(!show)}
          aria-expanded={show}
        >
          <Flex justifyContent="flex-start">
            <Icon name={show ? "chevrondown" : "chevronright"} />
            <Text variant="table">{title}</Text>
          </Flex>
          {note && (
            <Text variant="table" sx={{ fontWeight: "light" }}>
              {note}
            </Text>
          )}
        </Flex>
      </Heading>
      {show && (
        <Box as="fieldset" aria-hidden={!show} variant="controlSectionContent">
          <legend style={{ display: "none" }}>{title}</legend>
          {children}
        </Box>
      )}
    </Box>
  );
};
