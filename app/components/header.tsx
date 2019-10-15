import * as React from "react";
import { Box, Flex, Text, Image } from "rebass";
import { LanguageMenu } from "./language-menu";
import { Trans } from "@lingui/macro";

export const Logo = () => (
  <Flex>
    <Image
      src="/static/logo/BUND_Logo_CH.png"
      alt="logo of the Swiss Confederation"
      width="224px"
      sx={{ pr: 6 }}
    />
    <Text
      as="h1"
      variant="lead"
      sx={{
        pl: 6,
        borderLeftWidth: "1px",
        borderLeftStyle: "solid",
        borderLeftColor: "monochrome.300"
      }}
    >
      <Trans>visualize.admin.ch</Trans>
    </Text>
  </Flex>
);
export const Header = () => (
  <Box variant="header.root">
    <Flex justifyContent="space-between" alignItems="flex-start">
      <Logo />
      <LanguageMenu />
    </Flex>
  </Box>
);
