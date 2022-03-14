import { Box, BoxProps } from "@mui/material";
import React from "react";

const Flex = (props: BoxProps) => {
  return <Box display="flex" {...props} />;
};

export type FlexProps = BoxProps;

export default Flex;
