import React from "react";
import Link, { LinkProps } from "next/link";
import { useLocale } from "../lib/use-locale";
import * as qs from "querystring";
import { useRouter } from "next/router";

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
  href,
  as,
  ...rest
}: LinkProps & { children: React.ReactNode }) => {
  const locale = useLocale();
  const pathname =
    typeof href === "string" ? href : href.pathname ? href.pathname : "";
  const query = typeof href === "string" ? undefined : href.query;
  const search = qs.stringify(query as qs.ParsedUrlQueryInput);
  const localizedAs = as
    ? as
    : pathname.replace(/\[locale\]/, locale) + (search ? `?${search}` : "");

  return <Link href={href} as={localizedAs} {...rest} />;
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
