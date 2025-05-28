import { Box } from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { ReactNode } from "react";

const VisuallyHidden = ({ children }: { children: ReactNode }) => {
  // @ts-ignore - I do not know why CSSProperties do not go directly into sx. It works.
  return <Box sx={visuallyHidden}>{children}</Box>;
};

export default VisuallyHidden;
