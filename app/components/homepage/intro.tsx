import React from "react";
import { Box, Button, Text, Flex } from "@theme-ui/components";
import { HintBlue, HintRed } from "../hint";
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
    <Box sx={{ maxWidth: 1024 }} m="0 auto">
      <Box mx={4} my={6}>
        <HintRed iconName="warning">{hint}</HintRed>
      </Box>
      <Box
        mx={4}
        pt={["62px", "88px"]}
        pb={[7, 8]}
        sx={{
          backgroundImage: [
            'url("chart_icons_s.jpg")',
            'url("chart_icons.jpg")',
            'url("chart_icons.jpg")'
          ],
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat"
        }}
      >
        <Box sx={{ maxWidth: 657 }} m="0 auto">
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <Flex sx={{ justifyContent: "center" }}>
            <LocalizedLink pathname="/[locale]/create/new" passHref>
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
    variant="toolTitle"
    color="monochrome800"
    sx={{ textAlign: "center" }}
  >
    {children}
  </Text>
);
export const Teaser = ({ children }: { children: React.ReactNode }) => (
  <Text
    variant="paragraph1"
    color="monochrome700"
    sx={{
      fontSize: [4, 4, 4],
      textAlign: "center"
    }}
    mb={[6, 5]}
  >
    {children}
  </Text>
);
