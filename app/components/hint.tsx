import * as React from "react";
import { Flex, Box } from "rebass";

export const Error = ({ children }: { children: React.ReactNode }) => (
  <Flex justifyContent="center" alignItems="center" variant={"error"}>
    <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
  </Flex>
);

export const Hint = ({ children }: { children: React.ReactNode }) => (
  <Flex justifyContent="center" alignItems="center" variant={"hint"}>
    <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
  </Flex>
);
export const Loading = ({ children }: { children: React.ReactNode }) => (
  <Flex justifyContent="center" alignItems="center" variant={"loading"}>
    <Box sx={{ width: "100%", height: "100%" }}>{children}</Box>
  </Flex>
);
