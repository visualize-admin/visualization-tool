import { Box, Flex, Text } from "@theme-ui/components";
import { ReactNode } from "react";
import { Icon } from "../icons";
import { HomepageSection } from "./generic";
import { Step1 } from "./step1";
import { Step2 } from "./step2";
import { Step3 } from "./step3";

export const Tutorial = ({
  headline,
  step1,
  step2,
  step3,
}: {
  headline: string;
  step1: string;
  step2: string;
  step3: string;
}) => {
  return (
    <Box
      sx={{ maxWidth: 1024, m: "0 auto", color: "monochrome800", px: 4, pb: 7 }}
    >
      <HomepageSection>{headline}</HomepageSection>
      <Flex
        sx={{
          flexDirection: ["column", "column", "row"],
          justifyContent: ["flex-start", "flex-start", "space-around"],
          alignItems: "center",
        }}
      >
        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Step1 />
          <HomepageTutorialStep>{step1}</HomepageTutorialStep>
        </Flex>

        <Arrow />

        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Step2 />
          <HomepageTutorialStep>{step2}</HomepageTutorialStep>
        </Flex>

        <Arrow />

        <Flex sx={{ flexDirection: "column", alignItems: "center" }}>
          <Step3 />
          <HomepageTutorialStep>{step3}</HomepageTutorialStep>
        </Flex>
      </Flex>
    </Box>
  );
};

const HomepageTutorialStep = ({ children }: { children: ReactNode }) => (
  <Text
    sx={{
      fontSize: 5,
      fontFamily: "body",
      mt: 4,
      mb: 2,
    }}
  >
    {children}
  </Text>
);

const Arrow = () => (
  <>
    <Box
      sx={{
        display: ["none", "none", "block"],
        zIndex: 12,
        mb: [4, 4, 6],
        mx: [0, 0, "-8px"],
      }}
    >
      <Icon size={32} name="arrowRight"></Icon>
    </Box>
    <Box
      sx={{
        display: ["block", "block", "none"],
        zIndex: 12,
        mb: [4, 4, 6],
        mx: [0, 0, "-8px"],
      }}
    >
      <Icon size={32} name="arrowDown"></Icon>
    </Box>
  </>
);
