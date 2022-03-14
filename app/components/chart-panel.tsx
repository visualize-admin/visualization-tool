import Flex from "../components/flex";
import { BoxProps } from "@mui/material";

import { ReactNode } from "react";

export const ChartPanel = ({
  children,
  ...boxProps
}: { children: ReactNode } & BoxProps) => (
  <Flex
    {...boxProps}
    sx={{
      bg: "monochrome100",
      boxShadow: "primary",
      borderRadius: "xl",
      overflow: "hidden",
      width: "auto",
      minHeight: [150, 300, 500],
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: "monochrome300",
      ...boxProps.sx,
    }}
  >
    {children}
  </Flex>
);
