import { IconButton, IconButtonProps } from "@mui/material";

import SvgIcClose from "@/icons/components/IcClose";

export const DialogCloseButton = (props: IconButtonProps) => (
  <IconButton
    {...props}
    sx={{ zIndex: 1, position: "absolute", top: "1rem", right: "1rem" }}
  >
    <SvgIcClose />
  </IconButton>
);
