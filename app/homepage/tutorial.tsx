import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Card, Typography } from "@mui/material";
import { ReactNode } from "react";

import { Flex } from "@/components/flex";
import { HomepageSectionTitle } from "@/homepage/generic";
import { Step1 } from "@/homepage/step1";
import { Step2 } from "@/homepage/step2";
import { Step3 } from "@/homepage/step3";

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
    <ContentWrapper sx={{ py: 20 }}>
      <div style={{ width: "100%" }}>
        <HomepageSectionTitle>{headline}</HomepageSectionTitle>
        <Flex
          sx={(t) => ({
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "flex-start",
            gap: 12,
            width: "100%",
            [t.breakpoints.up("lg")]: {
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            },
          })}
        >
          <Card>
            <Step1 />
            <HomepageTutorialStep>{step1}</HomepageTutorialStep>
          </Card>
          <Card>
            <Step2 />
            <HomepageTutorialStep>{step2}</HomepageTutorialStep>
          </Card>
          <Card>
            <Step3 />
            <HomepageTutorialStep>{step3}</HomepageTutorialStep>
          </Card>
        </Flex>
      </div>
    </ContentWrapper>
  );
};

const HomepageTutorialStep = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="h3"
    component="p"
    sx={{ px: 7, py: 11, fontWeight: "bold" }}
  >
    {children}
  </Typography>
);
