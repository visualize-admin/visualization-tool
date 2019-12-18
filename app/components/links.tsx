import React from "react";
import Link, { LinkProps } from "next/link";
import { useLocale } from "../lib/use-locale";
import * as qs from "querystring";
import { useRouter } from "next/router";
import { IconName, Icon } from "../icons";
import { Link as RebassLink } from "rebass";
const createDynamicRouteProps = ({
  pathname,
  query
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
    if (dynamicParams.has(k)) {
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
    as: asPath
  };
};

export const LocalizedLink = ({
  pathname,
  query,
  ...rest
}: Omit<LinkProps, "href" | "as"> & {
  pathname: string;
  query?: qs.ParsedUrlQuery;
  children?: React.ReactNode;
}) => {
  const locale = useLocale();
  return (
    <Link
      {...rest}
      {...createDynamicRouteProps({
        pathname,
        query: query ? { ...query, locale } : { locale }
      })}
    />
  );
};

export const HomeLink = (
  props: Omit<LinkProps, "href" | "as"> & {
    children?: React.ReactNode;
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
  children: React.ReactNode;
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
          query
        })}
      />
    );
  }

  return (
    <Link
      {...rest}
      {...createDynamicRouteProps({
        pathname,
        query: { ...query, locale }
      })}
    />
  );
};

export const IconLink = ({
  iconName,
  href,
  title,
  disabled = false
}: {
  iconName: IconName;
  title?: string;
  href: string;
  disabled?: boolean;
}) => (
  <RebassLink
    variant="iconLink"
    title={title}
    disabled={disabled}
    href={href}
    target="_blank"
    rel="noopener noreferrer"
  >
    <Icon name={iconName}></Icon>
  </RebassLink>
);
