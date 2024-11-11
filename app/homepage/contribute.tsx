import { Button, Link, Typography } from "@mui/material";

import Flex from "@/components/flex";

export const Contribute = ({
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
          paddingBottom: ["72px", "none"],
          borderBottom: ["1px solid #e5e5e5", "none"],
        }}
      >
        <Button
          component={Link}
          href={buttonUrl}
          target="_blank"
          variant="outlined"
          color="inherit"
          rel="noopener noreferrer"
          sx={{
            flexGrow: [1, 0, 0],
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
