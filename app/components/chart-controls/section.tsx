import * as React from "react";

import { Box, Text, Flex, Heading } from "rebass";
import { IconName, Icon } from "../../icons";

export const CollapsibleSection = ({
  title,
  titleId,
  children
}: {
  title?: React.ReactNode;
  titleId?: string;
  children: React.ReactNode;
}) => {
  return (
    <Box variant="controlSection">
      {title && (
        <Heading as="h2" id={titleId}>
          <Flex variant="controlSectionTitle" justifyContent="space-between">
            <Flex
              justifyContent="space-between"
              width="100%"
              color="monochrome.600"
            >
              <Text variant="table" color="monochrome.800">
                {title}
              </Text>
            </Flex>
          </Flex>
        </Heading>
      )}
      {children}
    </Box>
  );
};

export const SectionTitle = ({
  iconName,
  children
}: {
  iconName?: IconName;
  children: React.ReactNode;
}) => (
  <Heading as="h2">
    <Flex variant="controlSectionTitle" justifyContent="flex-start">
      {iconName && <Icon name={iconName}></Icon>}
      <Text variant="table" color="monochrome.800" ml={2}>
        {children}
      </Text>
    </Flex>
  </Heading>
);
