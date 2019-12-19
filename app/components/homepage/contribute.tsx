import React from "react";
import { Box, Button, Flex, Text, Link } from "rebass";

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
        <Flex flexDirection={["column", "row"]} px={4} py={[6, 6, 7]}>
          <Box width={["100%", "100%", "70%"]} mb={[6, 6, 0]}>
            <Text variant="homepageContribute">{headline}</Text>
            <Text variant="paragraph1">{description}</Text>
          </Box>
          <Flex
            justifyContent="center"
            alignItems="center"
            width={["100%", "100%", "30%"]}
          >
            <Link href="https://lindas-data.ch/">
              <Button variant="inverted">{buttonLabel}</Button>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
