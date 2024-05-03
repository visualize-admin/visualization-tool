import { Box, BoxProps } from "@mui/material";
import React, { forwardRef } from "react";

const Flex = forwardRef((props: BoxProps, ref) => {
  return <Box ref={ref} display="flex" {...props} />;
});

export type FlexProps = BoxProps;

export default Flex;
