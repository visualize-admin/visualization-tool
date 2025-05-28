import NextLink, { LinkProps } from "next/link";
import { ReactNode } from "react";

/** A link where the default link behavior can be disabled */
export const MaybeLink = ({
  disabled,
  children,
  ...props
}: LinkProps & { disabled: boolean; children: ReactNode }) => {
  if (disabled) {
    return <>{children}</>;
  }

  return <NextLink {...props}>{children}</NextLink>;
};
