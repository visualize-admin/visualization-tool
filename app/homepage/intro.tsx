import { ContentWrapper } from "@interactivethings/swiss-federal-ci/dist/components";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import NextLink from "next/link";
import { ReactNode } from "react";

import { Icon } from "@/icons";

export const Intro = ({
  title,
  teaser,
  buttonLabel,
  alertTitle,
  alertText,
}: {
  title: string;
  teaser: string;
  buttonLabel: string;
  alertTitle?: string;
  alertText?: string;
}) => {
  return (
    <Box sx={{ backgroundColor: "background.paper" }}>
      <ContentWrapper sx={{ py: 20 }}>
        <Box sx={{ width: "100%" }}>
          {alertText && (
            <Alert
              severity="warning"
              color="warning"
              icon={<Icon name="warningCircle" />}
              sx={{
                mb: 10,
                py: 3,
                px: 2,
                width: "100%",
              }}
            >
              {alertTitle && <AlertTitle>{alertTitle}</AlertTitle>}
              {alertText}
            </Alert>
          )}
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <NextLink href="/browse" passHref legacyBehavior>
            <Button variant="outlined" endIcon={<Icon name="arrowRight" />}>
              {buttonLabel}
            </Button>
          </NextLink>
        </Box>
      </ContentWrapper>
    </Box>
  );
};

const Title = ({ children }: { children: ReactNode }) => (
  <Typography
    variant="display2"
    component="h1"
    sx={{ mb: 10, fontWeight: 700, textWrap: "balance" }}
  >
    {children}
  </Typography>
);

const Teaser = ({ children }: { children: ReactNode }) => (
  <Box sx={{ mb: 8 }}>
    <Typography>{children}</Typography>
  </Box>
);
