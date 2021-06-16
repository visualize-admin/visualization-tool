import { Box, Flex, Link, Text } from "theme-ui";
import * as React from "react";

export const Contribute = ({
  headline,
  description,
  buttonLabel,
  buttonUrl,
}: {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
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
                mb: 3,
              }}
            >
              {headline}
            </Text>
            <Text as="div" variant="paragraph1">
              {description}
            </Text>
          </Box>
          <Flex
            sx={{
              justifyContent: "flex-end",
              alignItems: "center",
              width: ["100%", "50%", "30%"],
            }}
          >
            <Link
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                flexGrow: [1, 0, 0],
                textDecoration: "none",
                textAlign: "center",
              }}
              variant="buttons.inverted"
            >
              {buttonLabel}
            </Link>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
