import { Link } from "@mui/material";
import { LinkProps } from "next/link";
import React from "react";

/** A link where the default link behavior can be disabled */
const MaybeLink = ({
  disabled,
  children,
  ...props
}: LinkProps & { disabled: boolean; children: React.ReactNode }) => {
  const Wrapper = disabled ? React.Fragment : Link;
  const wrapperProps = disabled ? {} : props;
  return <Wrapper {...wrapperProps}>{children}</Wrapper>;
};

export default MaybeLink;
