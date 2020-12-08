import { Link as UILink } from "theme-ui";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import { ReactNode } from "react";
import { Icon, IconName } from "../icons";

export const HomeLink = (
  props: Omit<LinkProps, "href" | "as"> & {
    children?: ReactNode;
  }
) => {
  return <Link {...props} href={`/`} />;
};

export const CurrentPageLink = ({
  locale,
  ...rest
}: {
  locale: string;
  passHref?: boolean;
  children: ReactNode;
}) => {
  const { pathname, query } = useRouter();

  return <Link {...rest} href={{ pathname, query }} locale={locale} />;
};

export const IconLink = ({
  iconName,
  href,
  title,
  disabled = false,
}: {
  iconName: IconName;
  title?: string;
  href: string;
  disabled?: boolean;
}) => (
  <UILink
    title={title}
    // disabled={disabled}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    sx={{
      ml: 4,
      color: "primary",
      "&:disabled": {
        color: "primaryDisabled",
      },
      "&:hover": {
        color: "primaryHover",
      },
      "&:active": {
        color: "primaryActive",
      },
      "&:visited": {
        color: "primary",
      },
    }}
  >
    <Icon name={iconName}></Icon>
  </UILink>
);
