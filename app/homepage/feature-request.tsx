import { Button, Link, Typography } from "@mui/material";

import Flex from "@/components/flex";

export const FeatureRequest = ({
  headline,
  description,
  buttonLabel,
  buttonUrl,
}: {
  headline: string;
  description: string;
  buttonLabel: string;
  buttonUrl: string;
}) => {
  return (
    <Flex
      sx={{
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "48px",
        alignItems: ["start", "end"],
        width: "100%",
      }}
    >
      <Flex
        sx={{
          width: ["100%", "100%", "70%"],
          flexDirection: "column",
          gap: 4,
          maxWidth: ["100%", "330px"],
        }}
      >
        <Typography
          sx={{
            fontSize: ["1.5rem", "1.5rem", "2rem"],
            lineHeight: ["2.5rem", "2.5rem", "3rem"],
          }}
        >
          {headline}
        </Typography>
        <Typography component="div" variant="body1">
          {description}
        </Typography>
      </Flex>
      <Flex
        sx={{
          width: ["100%", "100%", "70%"],
          maxWidth: ["100%", "330px"],
        }}
      >
        <Button
          component={Link}
          href={buttonUrl}
          target="_blank"
          variant="contained"
          rel="noopener noreferrer"
          color="primary"
          sx={{
            textDecoration: "none",
            textAlign: "center",
          }}
        >
          {buttonLabel}
        </Button>
      </Flex>
    </Flex>
  );
};
