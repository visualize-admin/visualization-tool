import { ButtonBase, ButtonBaseProps, styled } from "@mui/material";
import { forwardRef, HTMLAttributeAnchorTarget } from "react";

const StyledButtonBase = styled(ButtonBase)({
  display: "flex",
  justifyContent: "flex-start",
  alignItems: "center",
  fontFamily: "inherit",
  textTransform: "none",
});

export type ButtonProps = ButtonBaseProps<
  "button",
  { href?: string; target?: HTMLAttributeAnchorTarget }
>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    return <StyledButtonBase ref={ref} disableRipple {...props} />;
  }
);
