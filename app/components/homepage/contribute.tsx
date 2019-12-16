import React from "react";
import { Box, Button, Flex, Text } from "rebass";

export const Contribute = ({
  headline,
  description,
  buttonLabel
}: {
  headline: string;
  description: string;
  buttonLabel: string;
}) => {
  return (
    <Box bg="primary.base" color="monochrome.100">
      <Box sx={{ maxWidth: 1024, margin: "0 auto" }}>
        <Flex flexDirection={["column", "row"]} px={[4, 4, 0]} py={[6, 6, 7]}>
          <Box width={["100%", "100%", "70%"]} mb={[6, 6, 0]}>
            <Text variant="homepageContribute">{headline}</Text>
            <Text variant="paragraph1">{description}</Text>
          </Box>
          <Flex
            justifyContent="center"
            alignItems="center"
            width={["100%", "100%", "30%"]}
          >
            <Button variant="inverted">{buttonLabel}</Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
