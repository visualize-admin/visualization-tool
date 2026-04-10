import { Link as MUILink, LinkProps, styled } from "@mui/material";
import { forwardRef } from "react";

import { c } from "@/federal-ci/theme";

const StyledLink = styled(MUILink)({
  color: c.text.primary,
  textDecoration: "none",
  cursor: "pointer",

  "&:hover": {
    color: c.text.activeLink,
  },
});

export const Link = forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => {
  return <StyledLink ref={ref} {...props} />;
});
