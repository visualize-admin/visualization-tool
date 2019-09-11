import React from "react";
import Link, { LinkProps } from "next/link";
import { useLocale } from "../lib/use-locale";
import * as qs from "querystring";
import { useRouter } from "next/router";

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
  const { locale: _, ...queryWithoutLocale } = query;
  const search = qs.stringify(queryWithoutLocale);
  const localizedAs =
    pathname.replace(/\[locale\]/, locale) + (search ? `?${search}` : "");

  return <Link href={{ pathname, query }} as={localizedAs} {...rest} />;
};
