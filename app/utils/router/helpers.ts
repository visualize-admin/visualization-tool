import { NextRouter } from "next/router";

import { maybeWindow } from "@/utils/maybe-window";

export const getURLParam = (param: string) => {
  const window = maybeWindow();
  const url = window ? new URL(window.location.href) : null;

  if (!url) {
    return undefined;
  }

  return url.searchParams.get(param);
};

export const updateRouterQuery = (
  { pathname, replace, query }: NextRouter,
  values: { [k: string]: string }
) => {
  replace({ pathname, query: { ...query, ...values } }, undefined, {
    shallow: true,
  });
};

export const setURLParam = (param: string, value: string) => {
  const { protocol, host, pathname, href } = window.location;
  const qs = new URL(href).searchParams;
  qs.delete(param);
  qs.append(param, value);
  const newUrl = `${protocol}//${host}${pathname}?${qs}`;
  window.history.replaceState(
    { ...window.history.state, path: newUrl },
    "",
    newUrl
  );
};

export const getRouterChartId = (asPath: string) => {
  return asPath.split("?")[0].split("/").pop();
};
