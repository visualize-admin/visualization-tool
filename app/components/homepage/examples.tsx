import React from "react";
import { Box, Text, Flex } from "rebass";

export const Examples = ({
  headline,
  example1Headline,
  example1Description,
  example2Headline,
  example2Description,
  example3Headline,
  example3Description
}: {
  headline: string;
  example1Headline: string;
  example1Description: string;
  example2Headline: string;
  example2Description: string;
  example3Headline?: string;
  example3Description?: string;
}) => {
  return (
    <Box p={4} color="monochrome.800">
      <Text variant="homepageSection">{headline}</Text>
      <Example
        headline={example1Headline}
        description={example1Description}
      ></Example>
      <Example
        headline={example2Headline}
        description={example2Description}
        reverse
      ></Example>
      {example3Headline && example3Description && (
        <Example
          headline={example3Headline}
          description={example3Description}
        ></Example>
      )}
    </Box>
  );
};

const Example = ({
  headline,
  description,
  reverse
}: {
  headline: string;
  description: string;
  reverse?: boolean;
}) => (
  <Flex
    flexDirection={["column", "column", "row"]}
    justifyContent={["flex-start", "flex-start", "space-between"]}
    alignItems={["center"]}
    mb={6}
  >
    <Box
      sx={{ order: reverse ? [1, 1, 2] : [2, 2, 1] }}
      width={["100%", "100%", "50%"]}
      ml={reverse ? [0, 0, 8] : 0}
      mr={reverse ? 0 : [0, 0, 8]}
    >
      <Text variant="homepageExampleHeadline">{headline}</Text>
      <Text variant="homepageExampleDescription">{description}</Text>
    </Box>
    <Box
      sx={{ order: reverse ? 1 : 2 }}
      bg="monochrome.400"
      height={300}
      width={["100%", "100%", "50%"]}
    >
      {/* <iframe title="oihdi"></iframe> */}
    </Box>
  </Flex>
);
