import * as React from "react";
import { Flex } from "rebass";

export const ActionBar = ({ children }: { children: React.ReactNode }) => (
  <Flex role="navigation" variant="actionBar" justifyContent="space-between">
    {children}
  </Flex>
);
