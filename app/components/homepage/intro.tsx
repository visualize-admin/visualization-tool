import React from "react";
import { Box, Button, Text, Flex } from "rebass";
import { HintBlue } from "../hint";
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
    <Box maxWidth={1024} m="0 auto">
      <Box px={4} pt={5}>
        <HintBlue iconName="info">{hint}</HintBlue>
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
        <Box maxWidth={657} m="0 auto">
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <Flex justifyContent="center">
            <LocalizedLink pathname="/[locale]/chart/new" passHref>
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
  <Text as="h1" variant="toolTitle" color="monochrome.800" textAlign="center">
    {children}
  </Text>
);
export const Teaser = ({ children }: { children: React.ReactNode }) => (
  <Text
    variant="paragraph1"
    fontSize={[4, 4, 4]}
    color="monochrome.700"
    textAlign="center"
    mb={[6, 5]}
  >
    {children}
  </Text>
);
