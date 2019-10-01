import preset from "@rebass/preset";
import { ThemeProvider } from "emotion-theming";
import { ReactNode } from "react";
import { Box, Flex, Heading } from "rebass";
import { LanguageMenu } from "./language-menu";

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <ThemeProvider theme={preset}>
    <Box p={2} bg="muted" color="secondary">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading fontSize={3}>Visualize</Heading>
        <LanguageMenu />
      </Flex>
    </Box>
    <Box p={2}>{children}</Box>
  </ThemeProvider>
);
