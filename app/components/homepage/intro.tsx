import React from "react";
import { Box, Button, Text, Flex } from "@theme-ui/components";
import { HintRed } from "../hint";
import { LocalizedLink } from "../links";

export const Intro = ({
  hint,
  title,
  teaser,
  buttonLabel
}: {
  hint: string;
  title: string;
  teaser: string;
  buttonLabel: string;
}) => {
  return (
    <Box sx={{ maxWidth: 1024, m: "0 auto" }}>
      <Box sx={{ mx: 4, my: 6 }}>
        <HintRed iconName="warning">{hint}</HintRed>
      </Box>
      <Box
        sx={{
          backgroundImage: [
            'url("chart_icons_s.jpg")',
            'url("chart_icons.jpg")',
            'url("chart_icons.jpg")'
          ],
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          mx: 4,
          pt: ["62px", "88px"],
          pb: [7, 8]
        }}
      >
        <Box sx={{ maxWidth: 657, m: "0 auto" }}>
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <Flex sx={{ justifyContent: "center" }}>
            <LocalizedLink
              pathname="/[locale]/create/[chartId]"
              query={{ chartId: "new" }}
              passHref
            >
              <Button as="a" variant="primary">
                {buttonLabel}
              </Button>
            </LocalizedLink>
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export const Title = ({ children }: { children: React.ReactNode }) => (
  <Text
    as="h1"
    sx={{
      color: "monochrome800",
      textAlign: "center",
      fontFamily: "body",
      lineHeight: 1.2,
      fontWeight: "bold",
      fontSize: [8, "3.5rem", "3.5rem"],
      mb: [4]
    }}
  >
    {children}
  </Text>
);
export const Teaser = ({ children }: { children: React.ReactNode }) => (
  <Text
    variant="paragraph1"
    sx={{
      fontSize: [4, 4, 4],
      textAlign: "center",
      color: "monochrome700",
      mb: [6, 5]
    }}
  >
    {children}
  </Text>
);
