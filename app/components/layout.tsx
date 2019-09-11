import { Box, Flex, Heading } from "rebass";
import { ReactNode } from "react";
import { ThemeProvider } from "emotion-theming";
import { Global, css } from "@emotion/core";
import preset from "@rebass/preset";

import { LanguageMenu } from "./language-menu";

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <ThemeProvider theme={preset}>
    <Global
      styles={{
        body: {
          margin: 0,
          padding: 0,
          fontFamily:
            "-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol;"
        }
      }}
    />
    <Box p={2} bg="muted" color="secondary">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading fontSize={3}>Visualize</Heading>
        <LanguageMenu />
      </Flex>
    </Box>
    <Box p={2}>{children}</Box>
  </ThemeProvider>
);
