import { Box, Typography } from "@mui/material";
import { ReactNode } from "react";

import Flex from "@/components/flex";
import { HomepageSectionTitle } from "@/homepage/generic";
import { Step1 } from "@/homepage/step1";
import { Step2 } from "@/homepage/step2";
import { Step3 } from "@/homepage/step3";
import { Icon } from "@/icons";

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
    <Box sx={{ maxWidth: 1024, m: "0 auto", color: "grey.800", px: 4, pb: 7 }}>
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
  <Typography
    component="div"
    variant="body1"
    sx={{
      mt: 4,
      mb: 2,
    }}
  >
    {children}
  </Typography>
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
