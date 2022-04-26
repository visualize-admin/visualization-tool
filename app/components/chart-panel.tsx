import { BoxProps } from "@mui/material";
import { ReactNode } from "react";

import Flex from "@/components/flex";

export const ChartPanel = ({
  children,
  ...boxProps
}: { children: ReactNode } & BoxProps) => (
  <Flex
    {...boxProps}
    sx={{
      backgroundColor: "grey.100",
      boxShadow: 6,
      borderRadius: 12,
      overflow: "hidden",
      width: "auto",
      minHeight: [150, 300, 500],
      ...boxProps.sx,
    }}
  >
    {children}
  </Flex>
);
