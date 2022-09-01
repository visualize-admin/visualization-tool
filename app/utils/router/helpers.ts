import { NextRouter } from "next/router";

import { isRunningInBrowser } from "../is-running-in-browser";

export const getURLParam = (param: string) => {
  const url = isRunningInBrowser() ? new URL(window.location.href) : null;
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
