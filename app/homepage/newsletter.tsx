import { Box, Button, Link, Typography } from "@mui/material";

import Flex from "@/components/flex";

export const Newsletter = ({
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
    <Box sx={{ color: "grey.800" }}>
      <Box sx={{ maxWidth: 1024, margin: "0 auto" }}>
        <Flex sx={{ flexDirection: ["column", "row"], px: 4, py: [6, 6, 7] }}>
          <Box sx={{ width: ["100%", "100%", "70%"], mb: [6, 6, 0] }}>
            <Typography
              sx={{
                fontSize: ["1.5rem", "1.5rem", "2rem"],
                lineHeight: 1.25,
                mb: 3,
              }}
            >
              {headline}
            </Typography>
            <Typography component="div" variant="body1">
              {description}
            </Typography>
          </Box>
          <Flex
            sx={{
              justifyContent: "flex-end",
              alignItems: "center",
              width: ["100%", "50%", "30%"],
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
                flexGrow: [1, 0, 0],
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              {buttonLabel}
            </Button>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
