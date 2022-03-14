import Flex from "../components/flex";
import { Box, Link, Typography } from "@mui/material";
import * as React from "react";

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
    <Box sx={{ bg: "primary", color: "grey.100" }}>
      <Box sx={{ maxWidth: 1024, margin: "0 auto" }}>
        <Flex sx={{ flexDirection: ["column", "row"], px: 4, py: [6, 6, 7] }}>
          <Box sx={{ width: ["100%", "100%", "70%"], mb: [6, 6, 0] }}>
            <Typography
              sx={{
                fontSize: [6, 6, 7],
                lineHeight: 1.25,
                fontFamily: "body",
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
            <Link
              href={buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                flexGrow: [1, 0, 0],
                textDecoration: "none",
                textAlign: "center",
              }}
              variant="buttons.inverted"
            >
              {buttonLabel}
            </Link>
          </Flex>
        </Flex>
      </Box>
    </Box>
  );
};
