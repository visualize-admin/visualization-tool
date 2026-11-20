import { Box, BoxProps } from "@mui/material";
import { visuallyHidden } from "@mui/utils";

type VisuallyHiddenProps = Omit<BoxProps, "sx" | "style">;

export const VisuallyHidden = (props: VisuallyHiddenProps) => {
  return <Box {...props} style={visuallyHidden} />;
};
