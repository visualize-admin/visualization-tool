import { Box, BoxProps } from "@mui/material";
import React from "react";

const Flex = React.forwardRef((props: BoxProps, ref) => {
  return <Box ref={ref} display="flex" {...props} />;
});

export type FlexProps = BoxProps;

export default Flex;
