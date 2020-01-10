import React from "react";
import { Box, Text, Flex } from "@theme-ui/components";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";
import { Icon } from "../../icons";

export const Tutorial = ({
  headline,
  step1,
  step2,
  step3
}: {
  headline: string;
  step1: string;
  step2: string;
  step3: string;
}) => {
  return (
    <Box
      sx={{ maxWidth: 1024 }}
      m="0 auto"
      color="monochrome800"
      px={4}
      pb={7}
    >
      <Text variant="homepageSection">{headline}</Text>
      <Flex
        sx={{
          flexDirection: ["column", "column", "row"],
          justifyContent: ["flex-start", "flex-start", "space-around"],
          alignItems: "center"
        }}
      >
        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Step1 />
          <Text variant="homepageTutorialStep">{step1}</Text>
        </Flex>

        <Arrow />

        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Step2 />
          <Text variant="homepageTutorialStep">{step2}</Text>
        </Flex>

        <Arrow />

        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Step3 />
          <Text variant="homepageTutorialStep">{step3}</Text>
        </Flex>
      </Flex>
    </Box>
  );
};

const Arrow = () => (
  <>
    <Box
      sx={{ display: ["none", "none", "block"], zIndex: 12 }}
      mb={[4, 4, 6]}
      mx={[0, 0, "-8px"]}
    >
      <Icon size={32} name="arrowRight"></Icon>
    </Box>
    <Box
      sx={{ display: ["block", "block", "none"], zIndex: 12 }}
      mb={[4, 4, 6]}
      mx={[0, 0, "-8px"]}
    >
      <Icon size={32} name="arrowDown"></Icon>
    </Box>
  </>
);
