import { PropsWithChildren } from "react";

import { Link } from "@/federal-ci/foundations";
import { c, s } from "@/federal-ci/theme";

export type FooterSectionLinkProps = PropsWithChildren<{
  href: string;
  external?: boolean;
}>;

export const FooterSectionLink = ({
  href,
  external = true,
  children,
}: FooterSectionLinkProps) => {
  return (
    <Link
      href={href}
      {...(external && { ...{ target: "_blank" } })}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: s(1),
        width: "fit-content",
        color: c.monochrome[50],

        "&:hover": {
          color: c.cobalt[200],
        },
      }}
    >
      {children}
    </Link>
  );
};
