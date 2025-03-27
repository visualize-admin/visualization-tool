import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Box, Button, Typography } from "@mui/material";
import NextLink from "next/link";
import { ReactNode } from "react";

import { Icon } from "@/icons";

export const Intro = ({
  title,
  teaser,
  buttonLabel,
}: {
  title: string;
  teaser: string;
  buttonLabel: string;
}) => {
  return (
    <Box sx={{ backgroundColor: "background.paper" }}>
      <ContentWrapper sx={{ py: 20 }}>
        <div>
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <NextLink href="/browse" passHref legacyBehavior>
            <Button variant="outlined" endIcon={<Icon name="arrowRight" />}>
              {buttonLabel}
            </Button>
          </NextLink>
        </div>
      </ContentWrapper>
    </Box>
  );
};

const Title = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="display2"
    component="h1"
    sx={{ mb: 10, textWrap: "balance" }}
  >
    {children}
  </Typography>
);

const Teaser = ({ children }: { children: ReactNode }) => (
  <Box sx={{ mb: 8 }}>
    <Typography>{children}</Typography>
  </Box>
);
