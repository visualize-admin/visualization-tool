import React from "react";
import { Box, Button, Flex, Text, Link } from "@theme-ui/components";

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
    <Box sx={{ bg: "primary", color: "monochrome100" }}>
      <Box sx={{ maxWidth: 1024, margin: "0 auto" }}>
        <Flex sx={{ flexDirection: ["column", "row"], px: 4, py: [6, 6, 7] }}>
          <Box sx={{ width: ["100%", "100%", "70%"], mb: [6, 6, 0] }}>
            <Text
              sx={{
                fontSize: [6, 6, 7],
                lineHeight: 1.25,
                fontFamily: "body",
                mb: 3
              }}
            >
              {headline}
            </Text>
            <Text variant="paragraph1">{description}</Text>
          </Box>
          <Flex
            sx={{
              justifyContent: "center",
              alignItems: "center",
              width: ["100%", "100%", "30%"]
            }}
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
