import { ButtonBase, ButtonBaseProps, styled } from "@mui/material";
import { forwardRef } from "react";

const StyledButtonBase = styled(ButtonBase)({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  fontFamily: "inherit",
  textTransform: "none",
});

export const Button = forwardRef<HTMLButtonElement, ButtonBaseProps>(
  (props, ref) => {
    return <StyledButtonBase ref={ref} disableRipple {...props} />;
  }
);
