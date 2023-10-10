import { Box, Button, Typography } from "@mui/material";
import NextLink from "next/link";
import { ReactNode } from "react";

import { HintRed } from "@/components/hint";

export const Intro = ({
  warningHint,
  title,
  teaser,
  buttonLabel,
}: {
  warningHint?: string;
  title: string;
  teaser: string;
  buttonLabel: string;
}) => {
  return (
    <>
      {warningHint && (
        <Box sx={{ maxWidth: "64rem", m: "0 auto" }}>
          <Box sx={{ mx: 4, mt: 6 }}>
            <HintRed iconName="hintWarning">{warningHint}</HintRed>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          py: [7, 8],
          margin: "0 auto",
          maxWidth: "105rem",
          display: "grid",
          alignItems: "center",
          justifyItems: "center",
        }}
      >
        <Box
          sx={{
            p: 4,
            maxWidth: "64rem",
            textAlign: "center",
          }}
        >
          <Title>{title}</Title>
          <Teaser>{teaser}</Teaser>
          <NextLink href="/browse" passHref legacyBehavior>
            <Button
              size="large"
              component="a"
              variant="contained"
              color="primary"
            >
              {buttonLabel}
            </Button>
          </NextLink>
        </Box>
      </Box>
    </>
  );
};

export const Title = ({ children }: { children: ReactNode }) => (
  <Typography
    component="h1"
    sx={{
      color: "grey.800",
      textAlign: "center",
      textWrap: "balance",

      lineHeight: [1.2, 1.2, 1.2],
      fontWeight: "bold",
      fontSize: ["2.5rem", "3.5rem", "3.5rem"],
      mb: 4,
    }}
  >
    {children}
  </Typography>
);

export const Teaser = ({ children }: { children: ReactNode }) => (
  <Box sx={{ mb: [6, 5] }}>
    <Typography
      variant="body1"
      sx={{
        fontSize: ["1rem", "1rem", "1rem"],
        textAlign: "center",
        color: "grey.700",
      }}
    >
      {children}
    </Typography>
  </Box>
);
