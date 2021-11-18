import Link, { LinkProps } from "next/link";
import React from "react";
import { Button, ButtonProps } from "theme-ui";

const ButtonLink = ({
  children,
  href,
  ...buttonProps
}: {
  children: React.ReactNode;
  href: LinkProps["href"];
} & ButtonProps) => {
  return (
    <Link href={href} passHref>
      <Button as="a" {...buttonProps}>
        {children}
      </Button>
    </Link>
  );
};

export default ButtonLink;
