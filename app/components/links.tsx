import { Link as UILink } from "@theme-ui/components";
import Link, { LinkProps } from "next/link";
import { useRouter } from "next/router";
import * as qs from "querystring";
import { ReactNode } from "react";
import { Icon, IconName } from "../icons";
import { useLocale } from "../lib/use-locale";
const createDynamicRouteProps = ({
  pathname,
  query,
}: {
  pathname: string;
  query: qs.ParsedUrlQuery;
}) => {
  let asPath = pathname;
  let regularQueryParams: qs.ParsedUrlQuery = {};

  // Get dynamic route params from pathname
  const dynamicParamRe = /\[(\w+)\]/g;
  let dynamicParams: Set<string> = new Set();
  let match: RegExpExecArray | null;
  while ((match = dynamicParamRe.exec(pathname))) {
    dynamicParams.add(match[1]);
  }

  // Replace dynamic route params in `asPath`
  for (const [k, v] of Object.entries(query)) {
    if (dynamicParams.has(k) && v) {
      asPath = asPath.replace(`[${k}]`, v.toString());
    } else {
      regularQueryParams[k] = v;
    }
  }

  // Add query params that aren't part of the route as search to `asPath`
  if (Object.keys(regularQueryParams).length > 0) {
    asPath = `${asPath}?${qs.stringify(regularQueryParams)}`;
  }

  return {
    href: { pathname, query },
    as: asPath,
  };
};

export const LocalizedLink = ({
  pathname,
  query,
  ...rest
}: Omit<LinkProps, "href" | "as"> & {
  pathname: string;
  query?: qs.ParsedUrlQuery;
  children?: ReactNode;
}) => {
  const locale = useLocale();
  return (
    <Link
      {...rest}
      {...createDynamicRouteProps({
        pathname,
        query: query ? { ...query, locale } : { locale },
      })}
    />
  );
};

export const HomeLink = (
  props: Omit<LinkProps, "href" | "as"> & {
    children?: ReactNode;
  }
) => {
  const locale = useLocale();
  return <Link {...props} href={`/${locale}`} as={`/${locale}`} />;
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

  /**
   * Hack for static content pages
   * */
  if (/^\/(en|de|fr|it)/.test(pathname)) {
    return (
      <Link
        {...rest}
        {...createDynamicRouteProps({
          pathname: pathname.replace(/^\/(en|de|fr|it)/, `/${locale}`),
          query,
        })}
      />
    );
  }

  return (
    <Link
      {...rest}
      {...createDynamicRouteProps({
        pathname,
        query: { ...query, locale },
      })}
    />
  );
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
