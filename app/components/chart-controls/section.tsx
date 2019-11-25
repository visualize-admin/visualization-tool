import * as React from "react";

import { Box, Text, Flex, Heading } from "rebass";
import { Icon } from "../../icons";

export const CollapsibleSection = ({
  title,
  children
}: {
  title?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [show, toggle] = React.useState(true);
  return (
    <Box variant="controlSection">
      {title && (
        <Heading as="h2">
          <Flex
            as="button"
            variant="controlSectionTitle"
            justifyContent="space-between"
            onClick={() => toggle(!show)}
            aria-expanded={show}
          >
            <Flex
              justifyContent="space-between"
              width="100%"
              color="monochrome.600"
            >
              <Text variant="table" color="monochrome.800">
                {title}
              </Text>
              <Icon name={show ? "chevronup" : "chevrondown"} />
            </Flex>
          </Flex>
        </Heading>
      )}
      {show && (
        <Box as="fieldset" aria-hidden={!show} variant="controlSectionContent">
          <legend style={{ display: "none" }}>{title}</legend>
          {children}
        </Box>
      )}
    </Box>
  );
};

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <Heading as="h2">
    <Flex variant="controlSectionTitle">
      <Flex justifyContent="flex-start">
        <Text variant="table" color="monochrome.800">
          {children}
        </Text>
      </Flex>
    </Flex>
  </Heading>
);
