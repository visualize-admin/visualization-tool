import { Flex } from "theme-ui";

import { ReactNode } from "react";

export const ChartPanel = ({ children }: { children: ReactNode }) => (
  <Flex
    sx={{
      bg: "monochrome100",
      boxShadow: "primary",
      width: "auto",
      minHeight: [150, 300, 500],
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "monochrome300",
    }}
  >
    {children}
  </Flex>
);
