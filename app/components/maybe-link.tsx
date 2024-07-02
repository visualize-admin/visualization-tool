import NextLink, { LinkProps } from "next/link";
import React from "react";

/** A link where the default link behavior can be disabled */
const MaybeLink = ({
  disabled,
  children,
  ...props
}: LinkProps & { disabled: boolean; children: React.ReactNode }) => {
  if (disabled) {
    return <>{children}</>;
  }

  return <NextLink {...props}>{children}</NextLink>;
};

export default MaybeLink;
