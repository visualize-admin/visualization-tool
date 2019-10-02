import { ReactNode } from "react";
import { Box, Flex, Heading } from "rebass";
import { LanguageMenu } from "./language-menu";

export const AppLayout = ({ children }: { children?: ReactNode }) => (
  <Flex flexDirection="column" sx={{ minHeight: "100vh" }}>
    <Box p={2} bg="muted" color="secondary">
      <Flex justifyContent="space-between" alignItems="center">
        <Heading fontSize={3}>Visualize</Heading>
        <LanguageMenu />
      </Flex>
    </Box>
    <Flex p={2} flex={1} flexDirection="column">
      {children}
    </Flex>
  </Flex>
);

export const Center = ({ children }: { children?: ReactNode }) => (
  <Flex flex={1} justifyContent="center" alignItems="center">
    {children}
  </Flex>
);
