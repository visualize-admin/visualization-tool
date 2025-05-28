import { Box, BoxProps } from "@mui/material";
import { forwardRef } from "react";

const Flex = forwardRef((props: BoxProps, ref) => {
  return <Box ref={ref} display="flex" {...props} />;
});

export default Flex;
